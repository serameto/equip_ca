# 🎰 카지노 장비 관리 시스템

효율적인 카지노 전산장비 불출현황 및 관리를 위한 웹 애플리케이션입니다.

## ✨ 주요 기능

- 📋 **장비 목록 관리**: 전체 장비 현황을 한눈에 확인
- 🔄 **상태 관리**: 현장자산, 재고, 수리대기, 수리중, 수리완료 상태 관리
- 🔍 **검색 및 필터링**: 장비명, 시리얼번호, 대여자명으로 빠른 검색
- 📊 **실시간 통계**: 각 상태별 장비 수량을 실시간 집계
- 📱 **반응형 디자인**: 데스크톱과 모바일에서 모두 사용 가능
- 🗃️ **데이터베이스 연동**: Supabase를 통한 실시간 데이터 동기화

## 🚀 빠른 시작

### 필수 요구사항

- Node.js 18+
- npm 또는 yarn

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🛠️ 기술 스택

- **Frontend**: React 18, TypeScript
- **Styling**: Tailwind CSS 4.0
- **UI Components**: Radix UI
- **Database**: Supabase (PostgreSQL)
- **Build Tool**: Vite
- **Deployment**: Vercel (권장)

## 📁 프로젝트 구조

```
├── components/          # React 컴포넌트
│   ├── ui/             # 재사용 가능한 UI 컴포넌트
│   ├── EquipmentManagement.tsx
│   └── SupabaseSetup.tsx
├── lib/                # 유틸리티 함수 및 라이브러리
│   └── supabase.ts     # Supabase 클라이언트
├── styles/             # CSS 스타일
│   └── globals.css
├── database/           # 데이터베이스 스키마
└── docs/              # 문서
```

## 🔧 설정 가이드

### Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. SQL Editor에서 `database/schema.sql` 실행
3. API 키를 환경 변수에 설정
4. 애플리케이션에서 "Supabase 연동 설정" 버튼 클릭

자세한 설정 방법은 [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)를 참조하세요.

## 📱 사용법

### 장비 등록

1. "새로운 장비 등록" 버튼 클릭
2. 장비명, 시리얼번호, 위치 등 필수 정보 입력
3. 초기 상태 선택 후 등록

### 상태 변경

1. 장비 목록에서 "상태변경" 버튼 클릭
2. 새로운 상태 선택
3. 필요 시 추가 정보 입력 (사용자명, 날짜 등)
4. 변경 사항 저장

### 데이터 필터링

- **탭 필터**: 전체, 수리대기, 수리중, 수리완료
- **검색**: 장비명, 시리얼번호, 대여자명으로 실시간 검색
- **상태별 통계**: 각 상태별 장비 수량 실시간 확인

## 🌐 배포

### Vercel 배포 (권장)

1. GitHub에 코드 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 연결
3. 환경 변수 설정
4. 자동 배포

자세한 배포 가이드는 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)를 참조하세요.

### 지원되는 플랫폼

- ✅ Vercel (권장)
- ✅ Netlify
- ✅ Firebase Hosting
- ✅ AWS S3 + CloudFront

## 🔒 보안

- 환경 변수를 통한 API 키 관리
- Supabase Row Level Security (RLS) 적용
- HTTPS 강제 사용
- XSS 및 CSRF 방어

## 🤝 기여하기

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 🆘 지원

문제가 발생하거나 질문이 있으시면:

- 📧 이메일: support@your-company.com
- 🐛 버그 리포트: [GitHub Issues](https://github.com/your-username/casino-equipment-management/issues)
- 📖 문서: [프로젝트 위키](https://github.com/your-username/casino-equipment-management/wiki)

---

**Made with ❤️ by Casino Management Team**