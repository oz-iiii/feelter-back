-- Supabase 커뮤니티 기능을 위한 데이터베이스 스키마
-- 이 파일을 Supabase SQL Editor에서 실행하세요

-- 1. posts 테이블 생성
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('review', 'discussion', 'emotion', 'general')),
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_avatar TEXT,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  movie_title VARCHAR(255),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  emotion VARCHAR(100),
  emotion_emoji VARCHAR(10),
  emotion_intensity INTEGER CHECK (emotion_intensity >= 1 AND emotion_intensity <= 5),
  tags TEXT[] DEFAULT '{}',
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  comments INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('hot', 'new', 'solved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. comments 테이블 생성
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id VARCHAR(255) NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_avatar TEXT,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  liked_by TEXT[] DEFAULT '{}',
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. users 테이블 생성 (auth.users와 별도의 프로필 테이블)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY, -- auth.users.id와 연결
  email VARCHAR(255),
  display_name VARCHAR(255),
  nickname VARCHAR(255),
  photo_url TEXT,
  bio TEXT,
  favorite_genres TEXT[] DEFAULT '{}',
  favorite_actors TEXT[] DEFAULT '{}',
  favorite_directors TEXT[] DEFAULT '{}',
  stats JSONB DEFAULT '{"postsCount": 0, "reviewsCount": 0, "discussionsCount": 0, "emotionsCount": 0, "likesReceived": 0, "commentsReceived": 0}',
  preferences JSONB DEFAULT '{"notifications": {"comments": true, "likes": true, "mentions": true, "newPosts": false}, "privacy": {"showEmail": false, "showStats": true}}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. cats 테이블 생성 (고양이 기능용)
CREATE TABLE IF NOT EXISTS cats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  level INTEGER DEFAULT 1,
  type VARCHAR(100) NOT NULL,
  experience INTEGER DEFAULT 0,
  max_experience INTEGER DEFAULT 100,
  description TEXT,
  specialty VARCHAR(255),
  achievements TEXT[] DEFAULT '{}',
  stats JSONB DEFAULT '{"reviews": 0, "discussions": 0, "emotions": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. emotions 테이블 생성 (감정 기록용)
CREATE TABLE IF NOT EXISTS emotions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  movie_title VARCHAR(255) NOT NULL,
  emotion VARCHAR(100) NOT NULL,
  emoji VARCHAR(10) NOT NULL,
  text TEXT NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(type);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_cats_user_id ON cats(user_id);
CREATE INDEX IF NOT EXISTS idx_emotions_user_id ON emotions(user_id);

-- 트리거 함수 생성 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 적용
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cats_updated_at BEFORE UPDATE ON cats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_emotions_updated_at BEFORE UPDATE ON emotions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RPC 함수들 생성
-- 게시글 조회수 증가
CREATE OR REPLACE FUNCTION increment_post_views(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET views = views + 1, updated_at = NOW()
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 게시글 댓글 수 증가
CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET comments = comments + 1, updated_at = NOW()
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 게시글 댓글 수 감소
CREATE OR REPLACE FUNCTION decrement_post_comments(post_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE posts 
    SET comments = GREATEST(comments - 1, 0), updated_at = NOW()
    WHERE id = post_id;
END;
$$ LANGUAGE plpgsql;

-- 사용자 계정 삭제 (모든 관련 데이터 삭제)
CREATE OR REPLACE FUNCTION delete_user_account()
RETURNS void AS $$
DECLARE
    user_id_to_delete VARCHAR(255);
BEGIN
    -- 현재 사용자 ID 가져오기
    user_id_to_delete := auth.uid()::VARCHAR;
    
    -- 관련 데이터 삭제 (외래키 제약으로 자동 삭제됨)
    DELETE FROM users WHERE id = user_id_to_delete;
    
    -- auth.users에서도 삭제
    DELETE FROM auth.users WHERE id = user_id_to_delete::UUID;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) 설정
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cats ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;

-- RLS 정책 생성
-- posts 테이블 정책
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert posts" ON posts FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own posts" ON posts FOR UPDATE USING (author_id = auth.uid()::VARCHAR);
CREATE POLICY "Users can delete their own posts" ON posts FOR DELETE USING (author_id = auth.uid()::VARCHAR);

-- comments 테이블 정책
CREATE POLICY "Comments are viewable by everyone" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert comments" ON comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update their own comments" ON comments FOR UPDATE USING (author_id = auth.uid()::VARCHAR);
CREATE POLICY "Users can delete their own comments" ON comments FOR DELETE USING (author_id = auth.uid()::VARCHAR);

-- users 테이블 정책
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (id = auth.uid()::VARCHAR);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid()::VARCHAR);
CREATE POLICY "Users can delete their own profile" ON users FOR DELETE USING (id = auth.uid()::VARCHAR);

-- cats 테이블 정책
CREATE POLICY "Users can view all cats" ON cats FOR SELECT USING (true);
CREATE POLICY "Users can insert their own cats" ON cats FOR INSERT WITH CHECK (user_id = auth.uid()::VARCHAR);
CREATE POLICY "Users can update their own cats" ON cats FOR UPDATE USING (user_id = auth.uid()::VARCHAR);
CREATE POLICY "Users can delete their own cats" ON cats FOR DELETE USING (user_id = auth.uid()::VARCHAR);

-- emotions 테이블 정책
CREATE POLICY "Users can view all emotions" ON emotions FOR SELECT USING (true);
CREATE POLICY "Users can insert their own emotions" ON emotions FOR INSERT WITH CHECK (user_id = auth.uid()::VARCHAR);
CREATE POLICY "Users can update their own emotions" ON emotions FOR UPDATE USING (user_id = auth.uid()::VARCHAR);
CREATE POLICY "Users can delete their own emotions" ON emotions FOR DELETE USING (user_id = auth.uid()::VARCHAR);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'Supabase 커뮤니티 스키마가 성공적으로 생성되었습니다!';
    RAISE NOTICE '이제 애플리케이션에서 실제 Supabase 서비스를 사용할 수 있습니다.';
END
$$;
