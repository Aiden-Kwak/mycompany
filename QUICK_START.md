# 🚀 빠른 시작 가이드

My Dev Company 프로젝트를 빠르게 시작하는 방법입니다.

## 📋 사전 요구사항

### 필수
- Node.js 18+ 
- Python 3.11+
- PostgreSQL 15+
- Redis 7+

### 선택 (Docker 사용 시)
- Docker
- Docker Compose

---

## 방법 1: Docker Compose 사용 (권장)

가장 빠르고 쉬운 방법입니다.

### 1. 환경 변수 설정

```bash
# 프론트엔드
cp frontend/.env.example frontend/.env.local

# 백엔드
cp backend/.env.example backend/.env
```

### 2. Docker Compose 실행

```bash
docker-compose up -d
```

### 3. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/api/docs

### 4. 로그 확인

```bash
# 전체 로그
docker-compose logs -f

# 특정 서비스 로그
docker-compose logs -f frontend
docker-compose logs -f backend
```

### 5. 중지

```bash
docker-compose down
```

---

## 방법 2: 수동 설치

### 1. 데이터베이스 및 Redis 실행

```bash
# PostgreSQL 실행 (macOS - Homebrew)
brew services start postgresql@15

# Redis 실행
brew services start redis

# 또는 Docker로 실행
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=devpassword postgres:15
docker run -d -p 6379:6379 redis:7-alpine
```

### 2. 데이터베이스 생성

```bash
createdb mydevcompany
```

### 3. 백엔드 설정

```bash
cd backend

# 가상 환경 생성
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 패키지 설치
pip install -r requirements.txt

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집

# 마이그레이션
python manage.py migrate

# 개발 서버 실행
python manage.py runserver
```

### 4. Celery Worker 실행 (별도 터미널)

```bash
cd backend
source venv/bin/activate
celery -A config worker -l info
```

### 5. 프론트엔드 설정 (별도 터미널)

```bash
cd frontend

# 패키지 설치
npm install

# 환경 변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

### 6. 접속

- **프론트엔드**: http://localhost:3000
- **백엔드 API**: http://localhost:8000

---

## 🔧 개발 환경 설정

### GitHub OAuth 설정

1. GitHub Developer Settings 접속
   - https://github.com/settings/developers

2. New OAuth App 생성
   - **Application name**: My Dev Company (Local)
   - **Homepage URL**: http://localhost:3000
   - **Authorization callback URL**: http://localhost:3000/auth/github/callback

3. Client ID와 Client Secret 복사

4. 백엔드 `.env` 파일에 추가
   ```
   GITHUB_CLIENT_ID=your_client_id
   GITHUB_CLIENT_SECRET=your_client_secret
   ```

### OpenCode API 키 설정

1. OpenCode 계정 생성 및 API 키 발급

2. 백엔드 `.env` 파일에 추가
   ```
   OPENCODE_API_KEY=your_api_key
   ```

### 암호화 키 생성

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

백엔드 `.env` 파일에 추가:
```
ENCRYPTION_KEY=생성된_키
```

---

## 📝 다음 단계

### 1. 프론트엔드 개발

```bash
cd frontend

# 컴포넌트 생성
mkdir -p components/pixel
mkdir -p components/dashboard
mkdir -p components/agents

# 개발 시작
npm run dev
```

### 2. 백엔드 개발

```bash
cd backend

# Django 앱 생성
python manage.py startapp auth
python manage.py startapp projects
python manage.py startapp github
python manage.py startapp agents

# 마이그레이션 생성
python manage.py makemigrations
python manage.py migrate
```

### 3. 테스트

```bash
# 프론트엔드 테스트
cd frontend
npm run lint

# 백엔드 테스트
cd backend
pytest
```

---

## 🐛 문제 해결

### 포트가 이미 사용 중인 경우

```bash
# 3000 포트 사용 중인 프로세스 확인
lsof -i :3000

# 8000 포트 사용 중인 프로세스 확인
lsof -i :8000

# 프로세스 종료
kill -9 <PID>
```

### Docker 볼륨 초기화

```bash
docker-compose down -v
docker-compose up -d
```

### npm 패키지 재설치

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Python 가상 환경 재생성

```bash
cd backend
rm -rf venv
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## 📚 추가 문서

- [개발 계획서](DEVELOPMENT_PLAN.md)
- [아키텍처 문서](ARCHITECTURE.md)
- [UI 디자인 가이드](UI_DESIGN_GUIDE.md)
- [GitHub 통합 가이드](GITHUB_INTEGRATION.md)
- [프로젝트 요약](PROJECT_SUMMARY.md)

---

## 💬 도움이 필요하신가요?

- GitHub Issues: [프로젝트 이슈 트래커]
- 문서: [전체 문서 보기](README.md)

Happy Coding! 🎮✨