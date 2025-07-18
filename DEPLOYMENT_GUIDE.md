# 🚀 카지노 장비 관리 시스템 웹 배포 가이드

이 가이드는 카지노 장비 관리 시스템을 실제 웹사이트로 배포하는 방법을 안내합니다.

## 📋 배포 전 준비사항

### 1. 필수 요구사항
- [Node.js](https://nodejs.org/) 18+ 설치
- [Git](https://git-scm.com/) 설치
- GitHub 계정 (권장)
- Supabase 계정 (데이터베이스 사용 시)

### 2. 프로젝트 설정 확인
```bash
# 현재 디렉토리에서 필수 파일들이 있는지 확인
ls -la
# 다음 파일들이 있어야 합니다:
# - App.tsx
# - package.json (또는 생성 필요)
# - .env.local
# - components/ 폴더
# - lib/ 폴더
```

## 🎯 추천 배포 플랫폼: Vercel

Vercel은 React 애플리케이션 배포에 가장 적합한 플랫폼입니다.

### Vercel 배포 단계

#### 1단계: 프로젝트 설정 파일 생성

먼저 `package.json` 파일이 필요합니다:

```json
{
  "name": "casino-equipment-management",
  "version": "1.0.0",
  "description": "카지노 장비 관리 시스템",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@supabase/supabase-js": "^2.39.0",
    "lucide-react": "^0.263.1",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.0.0",
    "vite": "^5.0.0",
    "tailwindcss": "^4.0.0-alpha.14",
    "@tailwindcss/vite": "^4.0.0-alpha.14"
  }
}
```

#### 2단계: Vite 설정 파일 생성

`vite.config.ts` 파일을 생성하세요:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  server: {
    port: 3000,
  },
})
```

#### 3단계: TypeScript 설정

`tsconfig.json` 파일을 생성하세요:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist"]
}
```

#### 4단계: HTML 파일 생성

`index.html` 파일을 루트에 생성하세요:

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/casino-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>카지노 장비 관리 시스템</title>
    <meta name="description" content="카지노 전산장비 불출현황 및 관리 시스템" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/main.tsx"></script>
  </body>
</html>
```

#### 5단계: React 진입점 생성

`main.tsx` 파일을 생성하세요:

```typescript
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

#### 6단계: GitHub Repository 생성

1. [GitHub](https://github.com)에서 새 repository 생성
2. Repository 이름: `casino-equipment-management`
3. Public 또는 Private 선택
4. README 추가하지 않음 (이미 파일들이 있으므로)

#### 7단계: Git 초기화 및 푸시

```bash
# Git 초기화
git init

# .gitignore 파일 생성
echo "node_modules/
dist/
.env.local
.env
*.log
.DS_Store" > .gitignore

# 모든 파일 추가
git add .

# 첫 번째 커밋
git commit -m "Initial commit: 카지노 장비 관리 시스템"

# GitHub repository와 연결 (your-username을 실제 사용자명으로 변경)
git remote add origin https://github.com/your-username/casino-equipment-management.git

# 푸시
git push -u origin main
```

#### 8단계: Vercel에 배포

1. [Vercel](https://vercel.com)에 접속하여 GitHub로 로그인
2. "New Project" 클릭
3. GitHub repository `casino-equipment-management` 선택
4. 프로젝트 설정:
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. 환경 변수 설정:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```
6. "Deploy" 클릭

#### 9단계: 커스텀 도메인 설정 (선택사항)

Vercel 대시보드에서:
1. 프로젝트 설정 → Domains
2. 원하는 도메인 입력 (예: `casino-management.yourdomain.com`)
3. DNS 설정 안내에 따라 도메인 제공업체에서 설정

## 🌐 대안 배포 플랫폼들

### Option 2: Netlify

1. [Netlify](https://netlify.com)에 가입
2. "New site from Git" 클릭
3. GitHub repository 연결
4. Build settings:
   ```
   Build command: npm run build
   Publish directory: dist
   ```
5. 환경 변수 설정 (Site settings → Environment variables)

### Option 3: Firebase Hosting

```bash
# Firebase CLI 설치
npm install -g firebase-tools

# Firebase 초기화
firebase init hosting

# 빌드
npm run build

# 배포
firebase deploy
```

### Option 4: AWS S3 + CloudFront

1. S3 버킷 생성 및 정적 웹사이트 호스팅 설정
2. 빌드 파일을 S3에 업로드
3. CloudFront 배포 생성
4. 커스텀 도메인 설정

## 🔧 배포 최적화

### 성능 최적화

1. **번들 크기 최적화**:
```typescript
// vite.config.ts에 추가
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select'],
        },
      },
    },
  },
})
```

2. **이미지 최적화**:
```bash
# 이미지 압축 도구 설치
npm install --save-dev vite-plugin-imagemin
```

### SEO 최적화

`index.html`에 메타 태그 추가:
```html
<meta name="keywords" content="카지노, 장비관리, 불출현황, 관리시스템" />
<meta name="author" content="Your Company Name" />
<meta property="og:title" content="카지노 장비 관리 시스템" />
<meta property="og:description" content="효율적인 카지노 전산장비 관리" />
<meta property="og:type" content="website" />
```

### 보안 설정

1. **환경 변수 보안**:
   - API 키는 환경 변수로만 관리
   - 프로덕션과 개발 환경 분리

2. **HTTPS 강제**:
   - 대부분의 현대 호스팅 플랫폼은 자동 HTTPS 제공

3. **CSP 헤더 설정** (Vercel의 경우):
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
        }
      ]
    }
  ]
}
```

## 📊 모니터링 설정

### 1. Google Analytics 추가

`index.html`에 추가:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_TRACKING_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_TRACKING_ID');
</script>
```

### 2. 에러 모니터링 (Sentry)

```bash
npm install @sentry/react
```

`main.tsx`에 추가:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

## 🚨 문제 해결

### 자주 발생하는 문제들

1. **빌드 실패**:
   ```bash
   # 의존성 재설치
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **환경 변수 인식 안됨**:
   - Vercel: 대시보드에서 환경 변수 재확인
   - 변수명이 `NEXT_PUBLIC_`로 시작하는지 확인

3. **라우팅 문제** (SPA):
   ```json
   // vercel.json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

4. **CORS 오류**:
   - Supabase 대시보드에서 허용된 도메인 추가

## 🎉 배포 완료 후 확인사항

1. ✅ 사이트가 정상적으로 로드되는지 확인
2. ✅ 모든 기능이 작동하는지 테스트
3. ✅ 모바일에서도 정상 작동하는지 확인
4. ✅ Supabase 연결이 정상인지 확인
5. ✅ 검색 엔진에서 사이트 검색 가능한지 확인

## 🔄 지속적인 업데이트

### 자동 배포 설정

GitHub Actions로 자동 배포:
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 💰 비용 안내

### 무료 옵션:
- **Vercel**: 개인/소규모 프로젝트 무료
- **Netlify**: 월 100GB 대역폭 무료
- **GitHub Pages**: 공개 repository 무료
- **Firebase**: 일정 사용량까지 무료

### 유료 업그레이드가 필요한 경우:
- 높은 트래픽 (월 10,000+ 방문자)
- 커스텀 도메인 (일부 플랫폼)
- 고급 분석 기능
- 우선 지원

---

## 📞 지원 및 문의

배포 과정에서 문제가 발생하면:

1. **공식 문서 확인**:
   - [Vercel 문서](https://vercel.com/docs)
   - [Netlify 문서](https://docs.netlify.com)
   - [Supabase 문서](https://supabase.com/docs)

2. **커뮤니티 지원**:
   - GitHub Issues
   - Discord 서버
   - Stack Overflow

성공적인 배포를 위해 이 가이드를 단계별로 따라하시기 바랍니다! 🚀