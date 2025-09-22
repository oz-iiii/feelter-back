-- contents 테이블의 RLS를 임시로 비활성화
-- 이 방법은 보안상 권장되지 않지만, 테스트를 위해 사용

-- RLS 비활성화
ALTER TABLE contents DISABLE ROW LEVEL SECURITY;

-- 확인 메시지
SELECT 'Contents 테이블 RLS가 비활성화되었습니다. 이제 모든 사용자가 데이터에 접근할 수 있습니다.' as message;
