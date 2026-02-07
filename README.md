# 🏢 My Dev Company - AI 자동 애플리케이션 개발 플랫폼

> 사장님이 되어 AI 부서들에게 업무를 지시하고, 자동으로 애플리케이션을 개발하는 귀여운 픽셀 아트 플랫폼

![Version](https://img.shields.io/badge/version-0.2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-development-orange.svg)
![Backend](https://img.shields.io/badge/backend-tested-green.svg)
![API](https://img.shields.io/badge/API-12%2F12%20passing-brightgreen.svg)

## 📋 목차

- [프로젝트 소개](#-프로젝트-소개)
- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [시작하기](#-시작하기)
- [프로젝트 구조](#-프로젝트-구조)
- [개발 로드맵](#-개발-로드맵)
- [기여하기](#-기여하기)
- [라이선스](#-라이선스)

## 🎯 프로젝트 소개

**My Dev Company**는 OpenCode를 기반으로 한 혁신적인 **노코드 AI 협업 개발 플랫폼**입니다.

**코딩 지식이 전혀 없어도** 누구나 애플리케이션을 만들 수 있습니다. 실제 개발 조직처럼 여러 부서(에이전트)가 협업하여 애플리케이션을 자동으로 개발하고, 모든 코드는 GitHub에 안전하게 저장됩니다.

### 💡 핵심 컨셉

- 🎮 **게임 같은 경험**: 사장님이 되어 회사를 경영하는 듯한 재미있는 UI
- 🤖 **AI 부서 협업**: 기획, 디자인, 개발, QA 부서가 병렬로 작업
- 👀 **투명한 프로세스**: 개발 과정을 실시간으로 관찰 가능
- 🎨 **픽셀 아트 UI**: 레트로 게임 스타일의 귀여운 인터페이스
- 🚫 **코드 비노출**: 플랫폼 내에서 코드를 볼 필요 없음
- 🐙 **GitHub 통합**: 모든 코드는 자동으로 GitHub에 저장 및 관리

### 🎬 사용 시나리오

```
1. GitHub 계정으로 로그인 (없으면 자동 생성 안내)
2. "할 일 관리 앱을 만들고 싶어요" 라고 요청
3. 설문을 통해 상세 요구사항 입력 (체크리스트 기반)
4. 플랫폼이 자동으로 GitHub 레포지토리 생성
5. 7개 AI 부서가 동시에 작업 시작
   - 💡 기획부: 기능 명세 작성 → GitHub 커밋
   - 🎨 디자인부: UI 설계 → GitHub 커밋
   - 💻 개발부(FE): React 컴포넌트 생성 → GitHub 커밋
   - 💻 개발부(BE): API 서버 구축 → GitHub 커밋
   - 🔍 QA부: 코드 리뷰 및 테스트 → GitHub 커밋
   - 📦 통합부: 모든 결과물 통합 → GitHub 커밋
6. 5분 후, GitHub에서 완성된 프로젝트 확인!
7. 코드를 보고 싶다면 GitHub에서, 아니면 그냥 다운로드해서 실행!
```

## ✨ 주요 기능

### 1. 🐙 GitHub 통합 (핵심 기능)
- **자동 로그인**: GitHub 계정으로 원클릭 로그인
- **자동 레포 생성**: 프로젝트 생성 시 GitHub 레포지토리 자동 생성
- **자동 커밋**: 에이전트가 작업할 때마다 자동으로 GitHub에 커밋
- **코드 비노출**: 플랫폼 내에서는 코드를 보지 않아도 됨
- **안전한 관리**: 모든 코드는 Private 레포지토리에 저장

### 2. 체크리스트 기반 요구사항 수집
- 자유 텍스트 최소화
- 선택 기반 인터페이스
- 5단계 설문 시스템

### 3. AI 부서 시스템
- **요구사항 해석 에이전트**: 설문 결과를 기술 스펙으로 변환
- **기획 에이전트**: 기능 목록 및 사용자 플로우 설계
- **디자인 에이전트**: UI 구조 및 컴포넌트 설계
- **프론트엔드 에이전트**: React/Next.js 코드 생성
- **백엔드 에이전트**: API 및 데이터베이스 구축
- **QA 에이전트**: 코드 리뷰 및 테스트
- **통합 에이전트**: 최종 결과물 병합

### 4. 실시간 모니터링
- 부서별 작업 상태 실시간 표시
- 진행률 시각화
- 로그 스트림
- 타임라인 뷰

### 5. 결과물 관리 (코드 비노출)
- 파일 구조 확인 (파일명만)
- GitHub 링크로 코드 확인
- 전체 프로젝트 다운로드
- 실행 가이드 자동 생성

## 🛠 기술 스택

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom Pixel CSS
- **State Management**: React Context / Zustand
- **Real-time**: WebSocket / Server-Sent Events

### Backend
- **Framework**: Django 5.0+
- **API**: Django REST Framework
- **Task Queue**: Celery
- **Cache**: Redis
- **Database**: PostgreSQL

### AI Integration
- **OpenCode API**: 코드 생성 및 리뷰
- **Agent System**: 커스텀 에이전트 오케스트레이션

### GitHub Integration
- **OAuth**: GitHub OAuth 2.0
- **API**: GitHub REST API v3
- **Webhooks**: GitHub Webhooks (예정)

### DevOps
- **Containerization**: Docker, Docker Compose
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana (예정)

## 🚀 시작하기

### 필수 요구사항

- Node.js 18+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (선택사항)

### 설치 방법

#### 1. 저장소 클론

```bash
git clone https://github.com/yourusername/my-dev-company.git
cd my-dev-company
```

#### 2. Docker Compose로 실행 (권장)

```bash
# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 필요한 값 입력

# 컨테이너 실행
docker-compose up -d

# 프론트엔드: http://localhost:3000
# 백엔드 API: http://localhost:8000
```

#### 3. 수동 설치

**Frontend 설정**:
```bash
cd frontend
npm install
npm run dev
```

**Backend 설정**:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Celery Worker 실행**:
```bash
cd backend
celery -A config worker -l info
```

**Redis 실행**:
```bash
redis-server
```

### 환경 변수 설정

**Frontend (.env.local)**:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8000
```

**Backend (.env)**:
```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/mydevcompany
REDIS_URL=redis://localhost:6379/0
OPENCODE_API_KEY=your-opencode-api-key

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_REDIRECT_URI=http://localhost:3000/auth/github/callback

# Token Encryption
ENCRYPTION_KEY=your-encryption-key
```

## 📁 프로젝트 구조

```
my-dev-company/
├── frontend/                 # Next.js 프론트엔드
│   ├── app/                 # App Router 페이지
│   ├── components/          # React 컴포넌트
│   │   ├── pixel/          # 픽셀 아트 컴포넌트
│   │   ├── dashboard/      # 대시보드 컴포넌트
│   │   ├── survey/         # 설문 컴포넌트
│   │   └── agents/         # 에이전트 카드 컴포넌트
│   ├── lib/                # 유틸리티 함수
│   ├── styles/             # 스타일 파일
│   └── public/             # 정적 파일
│       └── sprites/        # 픽셀 스프라이트
│
├── backend/                 # Django 백엔드
│   ├── config/             # Django 설정
│   ├── apps/
│   │   ├── auth/           # 인증 (GitHub OAuth)
│   │   ├── projects/       # 프로젝트 관리
│   │   ├── github/         # GitHub API 통합
│   │   ├── agents/         # 에이전트 시스템
│   │   │   ├── base_agent.py
│   │   │   ├── requirement_agent.py
│   │   │   ├── planning_agent.py
│   │   │   ├── design_agent.py
│   │   │   ├── frontend_agent.py
│   │   │   ├── backend_agent.py
│   │   │   ├── qa_agent.py
│   │   │   ├── integration_agent.py
│   │   │   └── orchestrator.py
│   │   ├── context/        # 공유 컨텍스트
│   │   └── opencode/       # OpenCode 통합
│   └── requirements.txt
│
├── docs/                    # 문서
│   ├── DEVELOPMENT_PLAN.md # 개발 계획서
│   ├── ARCHITECTURE.md     # 아키텍처 문서
│   ├── UI_DESIGN_GUIDE.md  # UI 디자인 가이드
│   └── GITHUB_INTEGRATION.md # GitHub 통합 가이드
│
├── docker-compose.yml       # Docker Compose 설정
├── .env.example            # 환경 변수 예시
└── README.md               # 이 파일
```

## 🗺 개발 로드맵

### Phase 1: 기반 구조 및 인증 ✅ 완료
- [x] 프로젝트 구조 설계
- [x] Django 프로젝트 초기화
- [x] Next.js 프론트엔드 설정
- [x] 데이터베이스 모델 설계
- [x] GitHub OAuth 구현
- [x] GitHub API 클라이언트 구현
- [x] REST API 구현 (12개 엔드포인트)
- [x] CORS 및 CSRF 설정

### Phase 2: 핵심 기능 구현 ✅ 완료
- [x] 프로젝트 관리 시스템
- [x] 에이전트 관리 시스템
- [x] 태스크 관리 시스템
- [x] 대시보드 통계 API
- [x] 픽셀 아트 UI 컴포넌트
- [x] 설문 시스템 UI
- [x] 에이전트 카드 UI

### Phase 3: API 테스트 및 버그 수정 ✅ 완료
- [x] 모든 백엔드 API 테스트 (12/12 통과)
- [x] "agents.map is not a function" 버그 수정
- [x] 페이지네이션 일관성 문제 해결
- [x] Create API 응답 데이터 완전성 수정
- [x] 배열 유효성 검사 추가
- [x] 환경 변수 설정 개선

### Phase 4: 브라우저 테스트 및 UI 개선 🔄 진행 중
- [ ] GitHub OAuth 플로우 E2E 테스트
- [ ] 모든 모달 기능 테스트
- [ ] 설문 시스템 전체 플로우 테스트
- [ ] 드래그 앤 드롭 기능 테스트
- [ ] 로딩 상태 추가
- [ ] 에러 바운더리 구현
- [ ] 성공 알림 구현

### Phase 5: 고급 기능 📋 예정
- [ ] OpenCode 통합
- [ ] 에이전트 오케스트레이션 시스템
- [ ] GitHub 자동 커밋 시스템
- [ ] WebSocket 실시간 통신
- [ ] 프로젝트 템플릿 시스템
- [ ] GitHub Actions 자동 설정
- [ ] 배포 자동화

## 📊 현재 상태 (2026-02-07)

### ✅ 완료된 기능
- **백엔드 API**: 12개 엔드포인트 모두 정상 작동
  - 인증 API
  - 대시보드 통계 API
  - 프로젝트 CRUD API
  - 에이전트 CRUD API
  - 태스크 CRUD API
- **프론트엔드 UI**: 기본 페이지 및 컴포넌트 구현
  - 로그인 페이지
  - 메인 대시보드
  - 프로젝트 생성 설문
  - 프로젝트 상세 페이지
  - 에이전트/태스크 관리 모달
- **버그 수정**: 주요 런타임 에러 해결
- **문서화**: API 테스트 결과 문서 작성

### 🔄 진행 중
- 브라우저 기반 E2E 테스트
- UI/UX 개선
- 에러 처리 강화

### 📋 다음 단계
1. 브라우저에서 전체 사용자 플로우 테스트
2. 로딩 상태 및 에러 처리 개선
3. OpenCode API 통합
4. 에이전트 자동화 시스템 구현

자세한 테스트 결과는 [API_TESTING_RESULTS.md](API_TESTING_RESULTS.md)를 참조하세요.

## 🎨 UI 미리보기

### GitHub 로그인
```
🐙 GitHub 계정으로 간편하게 시작하세요!
코드는 자동으로 GitHub에 저장됩니다.
```

### 메인 대시보드 (사장실)
```
🏢 사장님의 책상에서 프로젝트를 관리하고
부서들의 작업 상황을 한눈에 확인할 수 있습니다.
GitHub 레포지토리와 자동으로 연동됩니다.
```

### 프로젝트 생성 설문
```
📝 5단계 체크리스트를 통해
원하는 애플리케이션의 요구사항을 입력합니다.
완료하면 자동으로 GitHub 레포가 생성됩니다!
```

### 실시간 개발 모니터링
```
👀 각 부서의 AI 캐릭터가 실시간으로 작업하는
모습을 픽셀 아트 애니메이션으로 확인할 수 있습니다.
작업이 완료될 때마다 자동으로 GitHub에 커밋됩니다.
```

### 프로젝트 완료
```
✅ 프로젝트 완성!
코드를 보고 싶다면 GitHub에서 확인하세요.
아니면 그냥 다운로드해서 바로 실행하세요!
```

## 🤝 기여하기

기여를 환영합니다! 다음 방법으로 참여할 수 있습니다:

1. 이 저장소를 Fork 합니다
2. Feature 브랜치를 생성합니다 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 Push 합니다 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성합니다

### 개발 가이드라인

- 코드 스타일: ESLint + Prettier (Frontend), Black + isort (Backend)
- 커밋 메시지: [Conventional Commits](https://www.conventionalcommits.org/) 규칙 준수
- 테스트: 새로운 기능에는 반드시 테스트 코드 포함

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 📞 연락처

- 프로젝트 링크: [https://github.com/yourusername/my-dev-company](https://github.com/yourusername/my-dev-company)
- 이슈 트래커: [https://github.com/yourusername/my-dev-company/issues](https://github.com/yourusername/my-dev-company/issues)

## 🙏 감사의 말

- [OpenCode](https://opencode.com) - AI 코드 생성 엔진
- [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) - 픽셀 폰트
- 모든 오픈소스 기여자들

---

**Made with ❤️ and 🎮 by the My Dev Company Team**