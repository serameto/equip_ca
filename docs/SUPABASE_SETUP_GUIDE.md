# Supabase 데이터베이스 연동 가이드

이 가이드는 현재 localStorage를 사용하는 카지노 장비 관리 시스템을 실제 Supabase 데이터베이스로 연동하는 방법을 설명합니다.

## 목차
1. [Supabase 프로젝트 생성](#1-supabase-프로젝트-생성)
2. [데이터베이스 스키마 설정](#2-데이터베이스-스키마-설정)
3. [환경 변수 설정](#3-환경-변수-설정)
4. [코드 변경](#4-코드-변경)
5. [테스트 및 검증](#5-테스트-및-검증)
6. [문제 해결](#6-문제-해결)

---

## 1. Supabase 프로젝트 생성

### 1.1 Supabase 계정 생성 및 로그인
1. [Supabase 웹사이트](https://supabase.com)에 접속
2. "Start your project" 클릭
3. GitHub, Google, 또는 이메일로 회원가입/로그인

### 1.2 새 프로젝트 생성
1. 대시보드에서 "New Project" 클릭
2. 프로젝트 정보 입력:
   - **Organization**: 기본 조직 선택
   - **Project Name**: `casino-equipment-management`
   - **Database Password**: 강력한 비밀번호 설정 (반드시 기록해 두세요!)
   - **Region**: `Northeast Asia (Seoul)` 선택 (한국 기준)
3. "Create new project" 클릭
4. 프로젝트 생성 완료까지 2-3분 대기

### 1.3 프로젝트 설정 확인
프로젝트 생성 후 다음 정보를 확인하고 기록:
- **Project URL**: `https://your-project-id.supabase.co`
- **API Keys**: 
  - `anon` key (공개 키)
  - `service_role` key (서비스 키, 서버에서만 사용)

---

## 2. 데이터베이스 스키마 설정

### 2.1 SQL Editor 접속
1. Supabase 대시보드에서 "SQL Editor" 메뉴 클릭
2. "New query" 클릭

### 2.2 데이터베이스 스키마 생성
기존 `/database/schema.sql` 파일의 내용을 복사하여 SQL Editor에서 실행합니다.

### 2.3 실행 및 확인
1. "RUN" 버튼 클릭하여 SQL 실행
2. "Table Editor" 메뉴에서 `equipment` 테이블 생성 확인
3. 샘플 데이터가 정상적으로 삽입되었는지 확인

---

## 3. 환경 변수 설정

### 3.1 환경 변수 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용 추가:

```bash
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**⚠️ 주의**: 실제 값으로 교체해야 합니다.

### 3.2 .gitignore 설정
`.gitignore` 파일에 다음 라인 추가:
```
# Environment variables
.env.local
.env
```

---

## 4. 코드 변경

### 4.1 패키지 설치
터미널에서 다음 명령어 실행:
```bash
npm install @supabase/supabase-js
```

### 4.2 supabase.ts 파일 교체
현재 `/lib/supabase.ts` 파일을 `/lib/supabase-real.ts` 파일의 내용으로 교체합니다.

### 4.3 환경 변수 값 설정
`/lib/supabase.ts` 파일에서 다음 부분을 수정:

```typescript
// 환경 변수에서 값 가져오기
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project-id.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key-here';
```

실제 값으로 교체하거나 `.env.local` 파일에 정확한 값을 입력합니다.

---

## 5. 테스트 및 검증

### 5.1 연결 테스트
애플리케이션을 실행하기 전에 연결을 테스트합니다:

```typescript
// 콘솔에서 테스트
import { testConnection } from './lib/supabase';

testConnection().then(isConnected => {
  console.log('Supabase 연결 상태:', isConnected);
});
```

### 5.2 기본 기능 테스트
1. **데이터 조회**: 애플리케이션 실행 후 장비 목록이 표시되는지 확인
2. **데이터 추가**: 새로운 장비 등록 기능 테스트
3. **데이터 수정**: 기존 장비 상태 변경 기능 테스트
4. **데이터 검색**: 검색 기능이 정상 작동하는지 확인

### 5.3 브라우저 개발자 도구 확인
- Network 탭에서 Supabase API 호출 확인
- Console 탭에서 에러 메시지 확인
- 응답 시간 및 데이터 형식 확인

---

## 6. 문제 해결

### 6.1 일반적인 오류

#### "Invalid URL" 오류
```typescript
TypeError: Invalid URL
```
**해결 방법**: 
- `.env.local` 파일의 URL이 올바른지 확인
- URL이 `https://`로 시작하는지 확인
- 프로젝트 ID가 정확한지 확인

#### "Invalid API key" 오류
```typescript
Error: Invalid API key
```
**해결 방법**: 
- Supabase 대시보드에서 API 키 다시 확인
- anon key를 사용하고 있는지 확인 (service_role 키 아님)
- 환경 변수가 올바르게 설정되었는지 확인

#### "Table 'equipment' doesn't exist" 오류
```typescript
Error: relation "equipment" does not exist
```
**해결 방법**: 
- SQL Editor에서 스키마 생성 쿼리 다시 실행
- Table Editor에서 테이블 존재 여부 확인
- 데이터베이스 이름이 올바른지 확인

### 6.2 성능 최적화

#### 인덱스 추가
자주 조회되는 컬럼에 인덱스 추가:
```sql
CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_location ON equipment(location);
```

#### 페이지네이션 구현
대량의 데이터를 위한 페이지네이션:
```typescript
export async function fetchEquipmentPaginated(page: number = 1, limit: number = 50) {
  const from = (page - 1) * limit;
  const to = from + limit - 1;
  
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .range(from, to)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}
```

### 6.3 보안 설정

#### Row Level Security (RLS) 활성화
```sql
-- RLS 활성화
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽기 가능
CREATE POLICY "Enable read access for all users" ON equipment
  FOR SELECT USING (true);

-- 인증된 사용자만 수정 가능
CREATE POLICY "Enable insert for authenticated users only" ON equipment
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON equipment
  FOR UPDATE USING (auth.role() = 'authenticated');
```

### 6.4 로그 및 모니터링

#### 로그 확인
1. Supabase 대시보드 → "Logs" 메뉴
2. API 호출 로그 및 에러 확인
3. 성능 지표 모니터링

#### 에러 핸들링 개선
```typescript
export async function fetchEquipmentWithRetry(maxRetries: number = 3): Promise<Equipment[]> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchEquipment();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed:`, error);
      
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
  }
  
  throw lastError!;
}
```

---

## 7. 추가 기능

### 7.1 실시간 업데이트
```typescript
// 실시간 구독 설정
useEffect(() => {
  const subscription = subscribeToEquipmentChanges((payload) => {
    console.log('실시간 업데이트:', payload);
    loadEquipment(); // 데이터 새로고침
  });

  return () => {
    subscription.unsubscribe();
  };
}, []);
```

### 7.2 백업 및 복원
```sql
-- 데이터 백업
COPY equipment TO '/tmp/equipment_backup.csv' WITH CSV HEADER;

-- 데이터 복원
COPY equipment FROM '/tmp/equipment_backup.csv' WITH CSV HEADER;
```

### 7.3 데이터 검증
```typescript
// 데이터 일관성 확인
export async function validateData() {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .is('serial_number', null);
    
  if (data?.length > 0) {
    console.warn('시리얼번호가 없는 장비:', data);
  }
}
```

---

## 8. 배포 시 주의사항

### 8.1 환경 변수 설정
배포 플랫폼에서 환경 변수를 정확히 설정:
- Vercel: Settings → Environment Variables
- Netlify: Site settings → Environment variables
- Heroku: Config Vars

### 8.2 CORS 설정
Supabase 대시보드에서 허용할 도메인 추가:
1. Authentication → Settings
2. Site URL 및 Redirect URLs 설정

### 8.3 API 사용량 모니터링
- Supabase 대시보드에서 API 호출량 확인
- 필요시 요금제 업그레이드 검토

---

## 9. 지원 및 문의

### 공식 문서
- [Supabase 공식 문서](https://supabase.com/docs)
- [JavaScript/TypeScript 가이드](https://supabase.com/docs/reference/javascript)

### 커뮤니티
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase)

### 문제 보고
프로젝트 관련 문제는 팀 내부 이슈 트래커를 통해 보고해 주세요.

---

**마지막 업데이트**: 2024년 7월 15일
**가이드 버전**: v1.0.0