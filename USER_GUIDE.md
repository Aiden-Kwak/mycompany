# 📖 MyCompany AI Automation Platform - User Guide

## 🎯 Overview

MyCompany는 AI를 활용하여 프로젝트를 자동으로 개발하는 플랫폼입니다. 설문만 작성하면 AI가 기획부터 코드 생성까지 모든 과정을 자동화합니다.

---

## 🚀 Quick Start (5분 안에 시작하기)

### 1. 프로젝트 생성
```
1. 홈페이지 접속
2. "New Project" 버튼 클릭
3. 프로젝트 이름 입력
4. 설명 입력
5. "Create" 클릭
```

### 2. 설문 작성
```
1. 프로젝트 타입 선택 (웹앱, 모바일앱 등)
2. 주요 기능 입력
3. 기술 스택 선택
4. 우선순위 설정
5. "Submit" 클릭
```

### 3. AI 제공자 설정
```
1. 프로젝트 상세 페이지 이동
2. "Manage Keys" 버튼 클릭
3. OpenAI API 키 입력
4. "Save" 클릭
5. 상태가 "Active"로 변경 확인
```

### 4. 자동 개발 시작
```
1. "🤖 Generate Planning" 버튼 클릭
2. AI가 기획문서 생성 (30-60초)
3. "Approve & Continue" 클릭
4. 에이전트 자동 생성 확인
5. "🚀 Start Development" 버튼 클릭
6. 진행 상황 실시간 확인
```

---

## 📋 상세 가이드

### Step 1: 프로젝트 생성

#### 1.1 프로젝트 정보 입력
```
필수 정보:
- 프로젝트 이름: 예) "Todo App"
- 설명: 예) "Simple todo application with user authentication"

선택 정보:
- GitHub 저장소 (나중에 연결 가능)
```

#### 1.2 설문 작성
**카테고리별 질문**:

**1. Project Type (프로젝트 타입)**
```
질문: What type of project are you building?
옵션:
- Web Application
- Mobile App
- Desktop App
- API Service
- Chrome Extension
```

**2. Core Features (핵심 기능)**
```
질문: What are the main features?
예시 답변:
- User authentication (login/signup)
- Create, read, update, delete todos
- Mark todos as complete
- Filter todos by status
- Search functionality
```

**3. Tech Stack (기술 스택)**
```
질문: Preferred technology stack?
옵션:
Frontend:
- React
- Vue
- Angular
- Next.js

Backend:
- Node.js
- Python (Django/Flask)
- Ruby on Rails
- Go
```

**4. Database (데이터베이스)**
```
질문: Database preference?
옵션:
- PostgreSQL
- MySQL
- MongoDB
- SQLite
```

**5. Priority (우선순위)**
```
질문: What's most important?
옵션:
- Speed of development
- Code quality
- Scalability
- Cost efficiency
```

---

### Step 2: AI 제공자 설정

#### 2.1 API 키 발급

**OpenAI (추천)**
```
1. https://platform.openai.com 접속
2. 계정 생성/로그인
3. API Keys 메뉴 클릭
4. "Create new secret key" 클릭
5. 키 복사 (sk-...)
```

**Anthropic (Claude)**
```
1. https://console.anthropic.com 접속
2. 계정 생성/로그인
3. API Keys 메뉴 클릭
4. "Create Key" 클릭
5. 키 복사
```

**Google (Gemini)**
```
1. https://makersuite.google.com 접속
2. 계정 생성/로그인
3. "Get API Key" 클릭
4. 키 복사
```

#### 2.2 API 키 등록

**MyCompany에서 등록**:
```
1. 프로젝트 상세 페이지
2. "Manage Keys" 버튼 클릭
3. 제공자 선택 (OpenAI, Claude, Gemini)
4. API 키 입력
5. "Save" 클릭
6. 상태 확인 (Active/Not configured)
```

**보안 팁**:
- ✅ API 키는 암호화되어 저장됩니다
- ✅ 다른 사용자와 공유되지 않습니다
- ✅ 언제든지 삭제/변경 가능합니다

---

### Step 3: 기획문서 생성

#### 3.1 Planning Document 생성

**프로세스**:
```
1. "🤖 Generate Planning" 버튼 클릭
2. AI가 요구사항 분석 (10초)
3. PRD (Product Requirements Document) 생성 (30초)
4. 에이전트 추천 생성 (10초)
5. 총 소요 시간: 약 50초
```

**생성되는 문서**:
```
1. Executive Summary
   - 프로젝트 개요
   - 목표 및 비전
   - 성공 지표

2. Technical Requirements
   - 기술 스택
   - 아키텍처
   - 인프라 요구사항

3. Feature Specifications
   - 기능 목록
   - 상세 설명
   - 우선순위

4. Development Plan
   - 개발 단계
   - 마일스톤
   - 리소스 계획

5. Timeline
   - 일정 계획
   - 주요 마일스톤
   - 배포 계획
```

#### 3.2 에이전트 추천

**자동 추천되는 에이전트**:
```
1. 📋 Product Manager
   - 역할: 프로젝트 관리, 요구사항 정리
   - 스킬: Planning, Documentation, Coordination

2. 🎨 UI/UX Designer
   - 역할: 디자인, 사용자 경험
   - 스킬: Figma, Design Systems, User Research

3. 💻 Frontend Developer
   - 역할: 프론트엔드 개발
   - 스킬: React, TypeScript, CSS

4. ⚙️ Backend Developer
   - 역할: 백엔드 개발
   - 스킬: Python, Django, PostgreSQL

5. 🔍 QA Engineer
   - 역할: 테스트, 품질 보증
   - 스킬: Testing, Debugging, Automation

6. 🚀 DevOps Engineer
   - 역할: 배포, 인프라
   - 스킬: Docker, CI/CD, Cloud

7. 📊 Data Analyst
   - 역할: 데이터 분석
   - 스킬: SQL, Analytics, Reporting
```

#### 3.3 문서 검토 및 승인

**검토 포인트**:
```
✅ 요구사항이 정확히 반영되었는가?
✅ 기술 스택이 적절한가?
✅ 추천된 에이전트가 충분한가?
✅ 일정이 현실적인가?
```

**액션**:
```
- Approve & Continue: 승인 및 에이전트 생성
- Regenerate: 다시 생성
- Edit: 수동 수정 (향후 지원)
```

---

### Step 4: 자동 개발 시작

#### 4.1 개발 설정

**AutoDevelopmentModal에서 설정**:

**1. AI Provider 선택**
```
옵션:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude-3)
- Google (Gemini)
- Groq (Mixtral, Llama)

추천: GPT-4 (최고 품질)
```

**2. Model 선택**
```
OpenAI:
- gpt-4: 최고 품질, 높은 비용
- gpt-4-turbo-preview: 빠른 속도, 중간 비용
- gpt-3.5-turbo: 빠른 속도, 낮은 비용

Anthropic:
- claude-3-opus: 최고 품질
- claude-3-sonnet: 균형
- claude-3-haiku: 빠른 속도
```

**3. 실행 옵션**
```
☑ Run tasks in parallel
   - 빠른 실행 (10-15분)
   - 높은 비용

☐ Run tasks sequentially
   - 느린 실행 (20-30분)
   - 낮은 비용

☑ Auto-commit to GitHub
   - 자동 커밋
   - 수동 검토 불필요

☐ Send notification on completion
   - 완료 알림
   - 이메일/Slack
```

#### 4.2 비용 및 시간 예측

**예상 비용**:
```
GPT-4:
- 최소: $3.00
- 최대: $8.00
- 평균: $5.00

GPT-3.5-turbo:
- 최소: $0.50
- 최대: $1.50
- 평균: $1.00

Claude-3-Opus:
- 최소: $4.00
- 최대: $10.00
- 평균: $7.00
```

**예상 시간**:
```
병렬 실행:
- 10-15분

순차 실행:
- 20-30분

프로젝트 복잡도에 따라 변동
```

#### 4.3 개발 진행 추적

**DevelopmentProgressTracker**:

**전체 진행률**
```
████████░░ 80%

실시간 업데이트 (2초마다)
```

**태스크별 상태**
```
✅ Setup Project Structure (100%)
⏳ Generate Backend API (75%)
   └─ Creating models...
⏸️ Generate Frontend UI (0%)
⏸️ Generate Tests (0%)
```

**생성된 파일**
```
📁 Generated Files (12)
├─ package.json
├─ src/models/user.py
├─ src/api/routes.py
└─ ...
```

**라이브 로그**
```
[10:30:15] Starting backend task...
[10:30:20] Analyzing requirements...
[10:30:45] Generating models...
[10:31:10] Creating API routes...
```

---

## 🎓 Best Practices

### 1. 설문 작성 팁

**구체적으로 작성**:
```
❌ 나쁜 예: "Todo app"
✅ 좋은 예: "Todo app with user authentication, categories, due dates, and email reminders"
```

**우선순위 명확히**:
```
❌ 나쁜 예: "All features are important"
✅ 좋은 예: "Priority 1: User auth, Priority 2: CRUD, Priority 3: Search"
```

**기술 스택 명시**:
```
❌ 나쁜 예: "Modern stack"
✅ 좋은 예: "React + TypeScript + Node.js + PostgreSQL"
```

### 2. API 키 관리

**보안**:
```
✅ 절대 공유하지 마세요
✅ 정기적으로 교체하세요
✅ 사용량 모니터링하세요
✅ 비용 한도 설정하세요
```

**비용 절감**:
```
✅ GPT-3.5-turbo 사용 (간단한 프로젝트)
✅ 순차 실행 선택
✅ 불필요한 재생성 피하기
```

### 3. 기획문서 검토

**체크리스트**:
```
□ 모든 요구사항이 포함되었는가?
□ 기술 스택이 적절한가?
□ 에이전트 구성이 충분한가?
□ 일정이 현실적인가?
□ 비용이 예산 내인가?
```

### 4. 개발 모니터링

**주의사항**:
```
⚠️ 진행 중 브라우저 닫지 마세요
⚠️ 네트워크 연결 유지하세요
⚠️ 에러 발생 시 로그 확인하세요
```

---

## 🔧 Troubleshooting

### 문제 1: API 키가 작동하지 않음

**증상**:
```
- "Not configured" 상태 유지
- "Invalid API key" 에러
```

**해결**:
```
1. API 키 재확인
   - 복사 시 공백 포함 여부
   - 키 형식 확인 (sk-...)

2. API 키 재발급
   - 제공자 사이트에서 새 키 생성
   - MyCompany에 재등록

3. 계정 상태 확인
   - 결제 정보 등록 여부
   - 사용 한도 확인
```

### 문제 2: 기획문서 생성 실패

**증상**:
```
- "Generation failed" 에러
- 무한 로딩
```

**해결**:
```
1. 설문 내용 확인
   - 너무 짧거나 모호한 답변
   - 특수문자 포함 여부

2. API 키 확인
   - 유효한 키인지
   - 사용 한도 초과 여부

3. 재시도
   - "Regenerate" 버튼 클릭
   - 설문 수정 후 재시도
```

### 문제 3: 개발 진행 중 멈춤

**증상**:
```
- 진행률이 업데이트되지 않음
- 태스크가 "in_progress"에서 멈춤
```

**해결**:
```
1. 네트워크 확인
   - 인터넷 연결 상태
   - 방화벽 설정

2. 로그 확인
   - "Show Logs" 클릭
   - 에러 메시지 확인

3. 재시작
   - "Cancel" 후 재시작
   - 다른 모델 선택
```

---

## 💡 FAQ

### Q1: 비용은 얼마나 드나요?
```
A: 프로젝트 복잡도에 따라 다릅니다.

간단한 프로젝트 (Todo App):
- GPT-4: $3-5
- GPT-3.5: $0.5-1

중간 프로젝트 (E-commerce):
- GPT-4: $10-20
- GPT-3.5: $2-4

복잡한 프로젝트 (SNS):
- GPT-4: $30-50
- GPT-3.5: $5-10
```

### Q2: 얼마나 걸리나요?
```
A: 병렬 실행 시 10-15분, 순차 실행 시 20-30분입니다.

프로젝트 복잡도에 따라 변동:
- 간단: 5-10분
- 중간: 15-25분
- 복잡: 30-60분
```

### Q3: 생성된 코드 품질은?
```
A: AI 모델에 따라 다릅니다.

GPT-4:
- 최고 품질
- 프로덕션 준비 수준
- 최소한의 수정 필요

GPT-3.5:
- 좋은 품질
- 일부 수정 필요
- 프로토타입 수준

Claude-3:
- 매우 좋은 품질
- 상세한 주석
- 코드 설명 포함
```

### Q4: 여러 프로젝트를 동시에 실행할 수 있나요?
```
A: 네, 가능합니다.

각 프로젝트는 독립적으로 실행됩니다.
단, API 사용 한도를 고려하세요.
```

### Q5: 생성된 코드를 수정할 수 있나요?
```
A: 네, 자유롭게 수정 가능합니다.

1. GitHub에서 클론
2. 로컬에서 수정
3. 커밋 및 푸시
4. MyCompany에서 확인
```

---

## 📞 Support

### 문의
```
Email: support@mycompany.ai
Discord: discord.gg/mycompany
GitHub: github.com/mycompany/issues
```

### 피드백
```
기능 제안: feedback@mycompany.ai
버그 리포트: bugs@mycompany.ai
```

---

**Happy Coding! 🚀**

Made with ❤️ by MyCompany Team