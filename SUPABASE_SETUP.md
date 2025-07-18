# Supabase 데이터베이스 연동 설정 가이드

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 가입 및 프로젝트 생성
1. [Supabase 웹사이트](https://supabase.com)에 접속
2. "Start your project" 클릭 후 GitHub/Google 계정으로 로그인
3. "New Project" 클릭
4. 프로젝트 정보 입력:
   - **Name**: `casino-equipment-management`
   - **Database Password**: 강력한 비밀번호 설정
   - **Region**: `Northeast Asia (Seoul)` 선택
5. "Create new project" 클릭하고 2-3분 대기

### 1.2 API Keys 확인
프로젝트 대시보드에서 Settings → API로 이동:
- **URL**: `https://your-project-id.supabase.co`
- **anon public key**: 클라이언트에서 사용할 공개 키
- **service_role key**: 서버에서 사용할 비밀 키

## 2. 환경 변수 설정

### 2.1 .env.local 파일 수정
프로젝트 루트의 `.env.local` 파일에 실제 값을 입력:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 2.2 환경 변수 보안
- `.env.local` 파일은 git에 커밋하지 마세요
- 배포 시 호스팅 플랫폼에서 환경 변수 설정
- anon key는 공개 키이므로 클라이언트에서 사용 가능
- service_role key는 절대 클라이언트에 노출하지 마세요

## 3. 데이터베이스 스키마 생성

### 3.1 SQL Editor 사용
1. Supabase 대시보드에서 "SQL Editor" 메뉴 클릭
2. `/database/schema.sql` 파일의 내용을 복사
3. SQL Editor에 붙여넣기 후 "RUN" 클릭

### 3.2 스키마 확인
1. "Table Editor" 메뉴에서 `equipment` 테이블 확인
2. 9개의 샘플 데이터가 삽입되었는지 확인
3. 컬럼 구조와 제약조건 확인

## 4. 패키지 설치

### 4.1 Supabase 클라이언트 설치
```bash
npm install @supabase/supabase-js
```

### 4.2 타입스크립트 타입 생성 (선택사항)
```bash
npx supabase gen types typescript --project-id your-project-id > types/supabase.ts
```

## 5. 연결 테스트

### 5.1 애플리케이션 실행
```bash
npm run dev
```

### 5.2 기능 테스트
1. 장비 목록 조회 확인
2. 새 장비 등록 테스트
3. 장비 상태 변경 테스트
4. 검색 기능 테스트

## 6. 문제 해결

### 6.1 일반적인 오류

#### "Invalid URL" 오류
```
TypeError: Invalid URL
```
**해결방법**: 
- 환경 변수 URL 형식 확인: `https://your-project.supabase.co`
- 프로젝트 ID가 올바른지 확인

#### "Invalid API key" 오류
```
Error: Invalid API key
```
**해결방법**:
- Supabase 대시보드에서 API 키 재확인
- anon key 사용 여부 확인 (service_role 키 아님)

#### "relation does not exist" 오류
```
Error: relation "equipment" does not exist
```
**해결방법**:
- SQL Editor에서 schema.sql 재실행
- 테이블 생성 여부 확인

### 6.2 성능 최적화

#### 추가 인덱스 생성
```sql
CREATE INDEX idx_equipment_location ON equipment(location);
CREATE INDEX idx_equipment_borrower ON equipment(borrower);
```

#### 페이지네이션 구현
```typescript
// 50개씩 페이지네이션
const { data, error } = await supabase
  .from('equipment')
  .select('*')
  .range(0, 49)
  .order('created_at', { ascending: false });
```

## 7. 보안 설정

### 7.1 Row Level Security (RLS)
- 이미 활성화되어 있음
- 인증된 사용자만 수정 가능
- 모든 사용자가 읽기 가능

### 7.2 추가 보안 정책
```sql
-- 특정 사용자만 삭제 가능
CREATE POLICY "Enable delete for admin users only" ON equipment
  FOR DELETE USING (auth.jwt() ->> 'role' = 'admin');
```

## 8. 백업 및 복원

### 8.1 데이터 백업
```sql
-- CSV 형태로 백업
SELECT * FROM equipment;
```

### 8.2 자동 백업 설정
Supabase는 자동으로 백업을 생성하지만, 중요한 데이터는 별도 백업 권장

## 9. 모니터링

### 9.1 대시보드 확인
- API 사용량 모니터링
- 에러 로그 확인
- 성능 지표 검토

### 9.2 알림 설정
- 데이터베이스 사용량 알림
- 에러 발생 시 알림
- 성능 임계값 알림

## 10. 배포 시 주의사항

### 10.1 환경 변수 설정
- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Environment Variables
- Heroku: Settings → Config Vars

### 10.2 도메인 설정
Supabase Authentication → Settings에서:
- Site URL 설정
- Redirect URLs 설정

## 11. 추가 기능

### 11.1 실시간 업데이트
```typescript
// 실시간 데이터 구독
const subscription = supabase
  .channel('equipment-changes')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'equipment' }, 
    (payload) => {
      console.log('변경사항:', payload);
      // 데이터 새로고침 로직
    }
  )
  .subscribe();
```

### 11.2 파일 업로드 (선택사항)
```typescript
// 장비 사진 업로드
const { data, error } = await supabase.storage
  .from('equipment-images')
  .upload('equipment-photos/image.jpg', file);
```

---

## 지원 및 문의

- **Supabase 공식 문서**: https://supabase.com/docs
- **커뮤니티**: https://discord.supabase.com
- **GitHub**: https://github.com/supabase/supabase

설정 중 문제가 발생하면 위 리소스를 참고하거나 팀에 문의하세요.