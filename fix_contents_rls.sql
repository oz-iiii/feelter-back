-- contents 테이블 RLS 설정 및 정책 추가
-- 이 스크립트를 Supabase SQL Editor에서 실행하세요

-- 1. contents 테이블에 RLS 활성화 (이미 활성화되어 있어도 오류 없음)
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;

-- 2. 기존 정책이 있다면 삭제 (없어도 오류 없음)
DROP POLICY IF EXISTS "Contents are viewable by everyone" ON contents;
DROP POLICY IF EXISTS "Only authenticated users can insert contents" ON contents;
DROP POLICY IF EXISTS "Only authenticated users can update contents" ON contents;
DROP POLICY IF EXISTS "Only authenticated users can delete contents" ON contents;

-- 3. 새로운 정책 생성
-- 모든 사용자(로그인/로그아웃 상관없이)가 contents 조회 가능
CREATE POLICY "Contents are viewable by everyone" ON contents FOR SELECT USING (true);

-- 인증된 사용자만 수정 가능 (관리자 기능)
CREATE POLICY "Only authenticated users can insert contents" ON contents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update contents" ON contents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete contents" ON contents FOR DELETE USING (auth.role() = 'authenticated');

-- 완료 메시지
SELECT 'Contents 테이블 RLS 정책이 성공적으로 설정되었습니다!' as message;
