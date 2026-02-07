# My Dev Company - Backend

Django 기반의 REST API 백엔드 서버입니다.

## 시작하기

### 가상 환경 생성 및 활성화

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

### 패키지 설치

```bash
pip install -r requirements.txt
```

### 환경 변수 설정

```bash
cp .env.example .env
# .env 파일을 편집하여 필요한 값 입력
```

### 데이터베이스 마이그레이션

```bash
python manage.py migrate
```

### 개발 서버 실행

```bash
python manage.py runserver
```

서버는 [http://localhost:8000](http://localhost:8000)에서 실행됩니다.

### Celery Worker 실행 (별도 터미널)

```bash
celery -A config worker -l info
```

## 기술 스택

- **Framework**: Django 5.0+
- **API**: Django REST Framework
- **Database**: PostgreSQL
- **Cache/Queue**: Redis
- **Task Queue**: Celery

## 프로젝트 구조

```
backend/
├── config/                 # Django 설정
│   ├── settings.py
│   ├── urls.py
│   └── celery.py
├── apps/
│   ├── auth/              # 인증 (GitHub OAuth)
│   ├── projects/          # 프로젝트 관리
│   ├── github/            # GitHub API 통합
│   ├── agents/            # 에이전트 시스템
│   ├── context/           # 공유 컨텍스트
│   └── opencode/          # OpenCode 통합
├── requirements.txt
└── manage.py
```

## API 엔드포인트

### 인증
- `POST /api/auth/github/url` - GitHub OAuth URL 생성
- `GET /api/auth/github/callback` - GitHub OAuth 콜백
- `GET /api/auth/me` - 현재 사용자 정보

### 프로젝트
- `GET /api/projects/` - 프로젝트 목록
- `POST /api/projects/` - 프로젝트 생성
- `GET /api/projects/{id}/` - 프로젝트 상세
- `GET /api/projects/{id}/status/` - 진행 상황
- `GET /api/projects/{id}/commits/` - 커밋 히스토리

## 개발 가이드

### 코드 포맷팅

```bash
black .
isort .
```

### 린팅

```bash
flake8
```

### 테스트

```bash
pytest