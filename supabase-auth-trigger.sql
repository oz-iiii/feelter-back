-- 사용자 회원가입 시 자동으로 users 테이블에 프로필 생성하는 트리거

-- 1. 함수 생성: auth.users에 사용자가 생성될 때 users 테이블에 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    display_name,
    nickname,
    photo_url,
    bio,
    favorite_genres,
    favorite_actors,
    favorite_directors,
    stats,
    preferences,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'nickname', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'bio',
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    ARRAY[]::TEXT[],
    '{"postsCount": 0, "reviewsCount": 0, "discussionsCount": 0, "emotionsCount": 0, "likesReceived": 0, "commentsReceived": 0}'::JSONB,
    '{"notifications": {"comments": true, "likes": true, "mentions": true, "newPosts": false}, "privacy": {"showEmail": false, "showStats": true}}'::JSONB,
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 트리거 생성: auth.users 테이블에 INSERT 발생 시 함수 실행
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. 사용자 삭제 시 users 테이블도 정리하는 함수
CREATE OR REPLACE FUNCTION public.handle_user_delete()
RETURNS trigger AS $$
BEGIN
  DELETE FROM public.users WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. 트리거 생성: auth.users 테이블에서 DELETE 발생 시 함수 실행
CREATE OR REPLACE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_delete();

-- 5. 기존에 회원가입했지만 users 테이블에 없는 사용자들을 위한 마이그레이션
INSERT INTO public.users (
  id,
  email,
  display_name,
  nickname,
  photo_url,
  bio,
  favorite_genres,
  favorite_actors,
  favorite_directors,
  stats,
  preferences,
  created_at,
  updated_at
)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email),
  COALESCE(au.raw_user_meta_data->>'nickname', split_part(au.email, '@', 1)),
  au.raw_user_meta_data->>'avatar_url',
  au.raw_user_meta_data->>'bio',
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  ARRAY[]::TEXT[],
  '{"postsCount": 0, "reviewsCount": 0, "discussionsCount": 0, "emotionsCount": 0, "likesReceived": 0, "commentsReceived": 0}'::JSONB,
  '{"notifications": {"comments": true, "likes": true, "mentions": true, "newPosts": false}, "privacy": {"showEmail": false, "showStats": true}}'::JSONB,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN public.users pu ON au.id = pu.id
WHERE pu.id IS NULL;

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE 'Auth 트리거가 성공적으로 설정되었습니다!';
    RAISE NOTICE '이제 새로운 사용자가 회원가입할 때 자동으로 users 테이블에 프로필이 생성됩니다.';
END
$$;