-- 사용자 즐겨찾기와 시청이력을 위한 테이블 생성

-- 1. 즐겨찾기 테이블
CREATE TABLE user_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, movie_id)
);

-- 2. 시청이력 테이블
CREATE TABLE user_watch_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  movie_id TEXT NOT NULL,
  watch_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  movie_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS(Row Level Security) 활성화
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watch_history ENABLE ROW LEVEL SECURITY;

-- 4. 보안 정책 생성
-- 즐겨찾기 정책
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- 시청이력 정책
CREATE POLICY "Users can view own watch history" ON user_watch_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watch history" ON user_watch_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own watch history" ON user_watch_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own watch history" ON user_watch_history
  FOR DELETE USING (auth.uid() = user_id);

-- 5. 성능을 위한 인덱스 생성
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);
CREATE INDEX idx_user_favorites_movie_id ON user_favorites(movie_id);
CREATE INDEX idx_user_watch_history_user_id ON user_watch_history(user_id);
CREATE INDEX idx_user_watch_history_movie_id ON user_watch_history(movie_id);
CREATE INDEX idx_user_watch_history_watch_date ON user_watch_history(watch_date DESC);

-- 6. 테이블 설명 추가
COMMENT ON TABLE user_favorites IS '사용자별 즐겨찾기 영화 목록';
COMMENT ON TABLE user_watch_history IS '사용자별 시청이력 및 평점';

COMMENT ON COLUMN user_favorites.user_id IS '사용자 ID (auth.users 참조)';
COMMENT ON COLUMN user_favorites.movie_id IS '영화 ID (movies 테이블의 id)';

COMMENT ON COLUMN user_watch_history.user_id IS '사용자 ID (auth.users 참조)';
COMMENT ON COLUMN user_watch_history.movie_id IS '영화 ID (movies 테이블의 id)';
COMMENT ON COLUMN user_watch_history.rating IS '사용자 평점 (1-5점)';
COMMENT ON COLUMN user_watch_history.movie_data IS '시청 당시 영화 정보 스냅샷';