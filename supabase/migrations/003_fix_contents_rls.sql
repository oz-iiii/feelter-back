-- contents 테이블 RLS 정책 수정
-- 로그인/로그아웃 상관없이 모든 사용자가 contents를 조회할 수 있도록 설정

-- contents 테이블에 RLS 정책 생성 (모든 사용자가 조회 가능)
CREATE POLICY "Contents are viewable by everyone" ON contents FOR SELECT USING (true);

-- 필요하다면 인증된 사용자만 수정/삭제 가능하도록 설정
CREATE POLICY "Only authenticated users can insert contents" ON contents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can update contents" ON contents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Only authenticated users can delete contents" ON contents FOR DELETE USING (auth.role() = 'authenticated');
