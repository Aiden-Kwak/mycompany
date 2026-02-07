# My Dev Company - Frontend

Next.js 기반의 픽셀 아트 스타일 프론트엔드 애플리케이션입니다.

## 시작하기

### 패키지 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 열어 확인하세요.

### 빌드

```bash
npm run build
npm start
```

## 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Pixel CSS
- **Fonts**: Press Start 2P, VT323

## 프로젝트 구조

```
frontend/
├── app/
│   ├── layout.tsx          # 루트 레이아웃
│   ├── page.tsx            # 메인 페이지
│   └── globals.css         # 글로벌 스타일
├── components/             # React 컴포넌트
├── lib/                    # 유틸리티 함수
└── public/                 # 정적 파일
```

## 환경 변수

`.env.example`을 복사하여 `.env.local` 파일을 생성하세요:

```bash
cp .env.example .env.local