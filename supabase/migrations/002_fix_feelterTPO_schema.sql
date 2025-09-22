-- feelterTPO 테이블 스키마 수정
-- 배열 타입으로 필드들을 변경

-- 기존 테이블 삭제 (데이터가 있다면 백업 후 삭제)
DROP TABLE IF EXISTS feelterTPO CASCADE;

-- 새로운 feelterTPO 테이블 생성 (배열 타입 사용)
CREATE TABLE feelterTPO (
  feelterid SERIAL PRIMARY KEY,
  contentsid INTEGER NOT NULL,
  feelterTime TEXT[] NOT NULL DEFAULT '{}',
  feelterPurpose TEXT[] NOT NULL DEFAULT '{}',
  feelterOccasion TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX idx_feelterTPO_contentsid ON feelterTPO(contentsid);
CREATE INDEX idx_feelterTPO_time ON feelterTPO USING GIN(feelterTime);
CREATE INDEX idx_feelterTPO_purpose ON feelterTPO USING GIN(feelterPurpose);
CREATE INDEX idx_feelterTPO_occasion ON feelterTPO USING GIN(feelterOccasion);

-- RLS 활성화
ALTER TABLE feelterTPO ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성 (모든 사용자가 조회 가능)
CREATE POLICY "feelterTPO is viewable by everyone" ON feelterTPO FOR SELECT USING (true);
CREATE POLICY "feelterTPO is insertable by authenticated users" ON feelterTPO FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "feelterTPO is updatable by authenticated users" ON feelterTPO FOR UPDATE WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "feelterTPO is deletable by authenticated users" ON feelterTPO FOR DELETE WITH CHECK (auth.role() = 'authenticated');

-- updated_at 자동 업데이트 트리거
CREATE TRIGGER update_feelterTPO_updated_at 
  BEFORE UPDATE ON feelterTPO 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 테이블 설명 추가
COMMENT ON TABLE feelterTPO IS '콘텐츠별 TPO(Time, Purpose, Occasion) 필터링 데이터';
COMMENT ON COLUMN feelterTPO.feelterid IS '필터 ID (자동 증가)';
COMMENT ON COLUMN feelterTPO.contentsid IS '콘텐츠 ID (contents 테이블 참조)';
COMMENT ON COLUMN feelterTPO.feelterTime IS '추천 시간대 배열';
COMMENT ON COLUMN feelterTPO.feelterPurpose IS '추천 목적 배열';
COMMENT ON COLUMN feelterTPO.feelterOccasion IS '추천 상황 배열';
