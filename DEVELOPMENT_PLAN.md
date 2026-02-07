# 자동 애플리케이션 개발 플랫폼 - 개발 계획서

## 프로젝트 개요

**프로젝트명**: Agent-based Automatic Application Development Platform  
**컨셉**: 사장님이 부서에 업무를 지시하는 귀여운 픽셀 UI 기반 자동 개발 플랫폼  
**기술 스택**:
- Frontend: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- Backend: Django 5.0+, Django REST Framework, Celery
- Database: PostgreSQL
- Cache/Queue: Redis
- AI Integration: OpenCode API

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 사장실 대시보드 │  │ 설문 시스템   │  │ 부서 모니터링 │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │ REST API
┌─────────────────────────────────────────────────────────────┐
│                    Backend (Django)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │           Agent Orchestration System                  │   │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │   │
│  │  │기획부서 │ │디자인부서│ │개발부서 │ │QA부서 │        │   │
│  │  └────────┘ └────────┘ └────────┘ └────────┘        │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Shared Context Store (Redis)                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         OpenCode Integration Module                   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: 프로토타입 UI 개발 (Week 1-2)

### 1.1 프로젝트 초기 설정

**Frontend 구조**:
```
frontend/
├── app/
│   ├── layout.tsx                 # 루트 레이아웃
│   ├── page.tsx                   # 메인 페이지 (사장실)
│   ├── project/
│   │   ├── new/
│   │   │   └── page.tsx          # 프로젝트 생성 설문
│   │   └── [id]/
│   │       ├── page.tsx          # 프로젝트 대시보드
│   │       └── result/
│   │           └── page.tsx      # 결과물 페이지
│   └── api/                      # API Routes (Mock)
├── components/
│   ├── pixel/                    # 픽셀 아트 컴포넌트
│   │   ├── PixelCharacter.tsx   # 캐릭터 스프라이트
│   │   ├── PixelButton.tsx      # 픽셀 스타일 버튼
│   │   ├── PixelCard.tsx        # 픽셀 스타일 카드
│   │   └── PixelDialog.tsx      # 픽셀 스타일 다이얼로그
│   ├── dashboard/
│   │   ├── CEODesk.tsx          # 사장 책상 UI
│   │   ├── DepartmentGrid.tsx   # 부서 그리드
│   │   └── ProgressBar.tsx      # 진행률 표시
│   ├── survey/
│   │   ├── ChecklistForm.tsx    # 체크리스트 폼
│   │   └── StepIndicator.tsx    # 단계 표시기
│   └── agents/
│       ├── AgentCard.tsx         # 에이전트 카드
│       ├── AgentStatus.tsx       # 상태 표시
│       └── AgentOutput.tsx       # 산출물 미리보기
├── lib/
│   ├── pixel-utils.ts           # 픽셀 아트 유틸리티
│   └── mock-data.ts             # 목 데이터
├── styles/
│   ├── pixel.css                # 픽셀 아트 스타일
│   └── animations.css           # 애니메이션
└── public/
    └── sprites/                 # 픽셀 스프라이트 이미지
```

**Backend 구조**:
```
backend/
├── config/
│   ├── settings.py
│   ├── urls.py
│   └── celery.py
├── apps/
│   ├── projects/               # 프로젝트 관리
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── agents/                 # 에이전트 시스템
│   │   ├── models.py
│   │   ├── base_agent.py      # 베이스 에이전트 클래스
│   │   ├── requirement_agent.py
│   │   ├── planning_agent.py
│   │   ├── design_agent.py
│   │   ├── frontend_agent.py
│   │   ├── backend_agent.py
│   │   ├── qa_agent.py
│   │   ├── integration_agent.py
│   │   └── orchestrator.py    # 에이전트 오케스트레이터
│   ├── context/                # 공유 컨텍스트
│   │   ├── models.py
│   │   ├── manager.py
│   │   └── serializers.py
│   └── opencode/               # OpenCode 통합
│       ├── client.py
│       ├── parser.py
│       └── executor.py
├── requirements.txt
└── manage.py
```

### 1.2 픽셀 아트 UI 디자인 시스템

**컬러 팔레트** (레트로 게임 스타일):
```css
--pixel-primary: #4A90E2      /* 파란색 - 메인 */
--pixel-success: #7ED321      /* 초록색 - 완료 */
--pixel-warning: #F5A623      /* 주황색 - 진행중 */
--pixel-danger: #D0021B       /* 빨간색 - 오류 */
--pixel-bg-dark: #2C3E50      /* 어두운 배경 */
--pixel-bg-light: #ECF0F1     /* 밝은 배경 */
--pixel-text: #34495E         /* 텍스트 */
--pixel-border: #95A5A6       /* 테두리 */
```

**픽셀 폰트**:
- Primary: "Press Start 2P" (Google Fonts)
- Secondary: "VT323" (Google Fonts)

**애니메이션 스타일**:
- 깜빡임 효과 (Blink)
- 타이핑 효과 (Typewriter)
- 8비트 스타일 전환 (Pixelated Transition)
- 캐릭터 걷기 애니메이션 (Sprite Animation)

### 1.3 메인 대시보드 UI (사장실 컨셉)

**화면 구성**:
```
┌─────────────────────────────────────────────────────────┐
│  🏢 My Dev Company                    [사장님] 👔        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         📋 사장님의 책상                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │ 새 프로젝트 │  │ 진행중 (3) │  │ 완료 (12)  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         🏭 우리 회사 부서들                       │  │
│  │  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐  │  │
│  │  │기획부│  │디자인│  │개발부│  │QA부 │  │통합부│  │  │
│  │  │ 💡  │  │ 🎨  │  │ 💻  │  │ 🔍  │  │ 📦  │  │  │
│  │  │대기중│  │대기중│  │대기중│  │대기중│  │대기중│  │  │
│  │  └─────┘  └─────┘  └─────┘  └─────┘  └─────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         📊 최근 프로젝트                          │  │
│  │  • Todo App (완료) - 2024-02-05                  │  │
│  │  • E-commerce Site (진행중) - 2024-02-06        │  │
│  │  • Blog Platform (진행중) - 2024-02-07          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

**주요 기능**:
- 픽셀 아트 스타일의 사장 캐릭터 (우측 상단)
- 책상 위 서류 더미 애니메이션
- 부서별 캐릭터 idle 애니메이션
- 호버 시 부서 설명 툴팁
- 프로젝트 카드 클릭 시 상세 페이지 이동

### 1.4 요구사항 입력 설문 UI

**설문 단계**:
1. **프로젝트 기본 정보** (1/5)
   - 프로젝트 이름 입력
   - 서비스 한 줄 설명
   - 프로젝트 타입 선택

2. **플랫폼 선택** (2/5)
   - 웹 / 모바일 / 데스크톱 체크박스
   - 각 선택에 따른 아이콘 표시

3. **기술 스택** (3/5)
   - 프론트엔드 프레임워크
   - 백엔드 필요 여부
   - 데이터베이스 선택

4. **기능 옵션** (4/5)
   - 인증 기능
   - 외부 API 연동
   - 실시간 기능

5. **배포 및 문서** (5/5)
   - 배포 대상
   - 테스트 코드 생성
   - 문서 생성

**UI 특징**:
- 각 단계마다 픽셀 아트 일러스트
- 진행률 바 (픽셀 스타일)
- 이전/다음 버튼 (레트로 게임 스타일)
- 선택 시 효과음 (옵션)
- 자동 저장 기능

### 1.5 부서별 에이전트 카드 UI

**에이전트 카드 구조**:
```
┌─────────────────────────┐
│  👤 기획부 (Planning)    │
│  ━━━━━━━━━━━━━━━━━━━━  │
│  상태: 🟢 작업중          │
│  진행률: ████░░░░ 60%    │
│  ━━━━━━━━━━━━━━━━━━━━  │
│  💬 "기능 목록을 정리하고 │
│      있습니다..."        │
│  ━━━━━━━━━━━━━━━━━━━━  │
│  📄 산출물:              │
│  • 기능 명세서.md        │
│  • 사용자 플로우.md      │
│  [상세보기]              │
└─────────────────────────┘
```

**상태 표시**:
- 🔵 대기중 (Idle)
- 🟡 작업중 (Working)
- 🟢 완료 (Completed)
- 🔴 오류 (Error)
- ⏸️ 일시정지 (Paused)

**캐릭터 애니메이션**:
- 대기중: 천천히 깜빡임
- 작업중: 타이핑 애니메이션
- 완료: 엄지척 제스처
- 오류: 당황하는 모션

### 1.6 실시간 작업 진행 상황 시각화

**타임라인 뷰**:
```
시간 ─────────────────────────────────────────────>
     │
00:00│ [기획부] 작업 시작
00:15│ [디자인부] 작업 시작
00:30│ [기획부] 완료 ✓
00:45│ [개발부-FE] 작업 시작
01:00│ [개발부-BE] 작업 시작
01:15│ [디자인부] 완료 ✓
01:30│ [개발부-FE] 완료 ✓
     │ [개발부-BE] 진행중... 75%
```

**로그 스트림**:
```
[14:32:15] 🟢 기획부: 요구사항 분석 완료
[14:32:18] 🟡 기획부: 기능 목록 작성 중...
[14:32:45] 🟢 기획부: 기능 명세서 생성 완료
[14:32:46] 🟡 디자인부: UI 구조 설계 시작
[14:33:12] 🟡 디자인부: 컴포넌트 분해 중...
```

**전체 진행률**:
```
┌─────────────────────────────────────────┐
│  전체 진행률: 65%                        │
│  ████████████████████░░░░░░░░░░░░░░░░  │
│                                          │
│  완료: 4/7 부서                          │
│  예상 완료 시간: 약 5분 남음             │
└─────────────────────────────────────────┘
```

### 1.7 결과물 미리보기 및 다운로드 UI

**결과물 탭 구조**:
```
┌─────────────────────────────────────────────────┐
│ [📋 요약] [📁 파일] [📊 통계] [💬 로그]         │
├─────────────────────────────────────────────────┤
│                                                  │
│  ✅ 프로젝트 생성 완료!                          │
│                                                  │
│  📦 생성된 파일: 47개                            │
│  📝 문서: 8개                                    │
│  ⏱️ 소요 시간: 3분 24초                         │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │  📁 프로젝트 구조                         │  │
│  │  ├── frontend/                            │  │
│  │  │   ├── src/                             │  │
│  │  │   ├── public/                          │  │
│  │  │   └── package.json                     │  │
│  │  ├── backend/                             │  │
│  │  │   ├── app/                             │  │
│  │  │   └── requirements.txt                 │  │
│  │  └── docs/                                │  │
│  │      ├── README.md                        │  │
│  │      └── SETUP.md                         │  │
│  └──────────────────────────────────────────┘  │
│                                                  │
│  [💾 전체 다운로드] [👁️ 미리보기] [🔄 재생성]   │
└─────────────────────────────────────────────────┘
```

**파일 미리보기**:
- 코드 하이라이팅
- 파일 트리 네비게이션
- 검색 기능
- 개별 파일 다운로드

---

## Phase 2: 백엔드 개발 (Week 3-4)

### 2.1 Django 프로젝트 초기 설정

**필수 패키지**:
```txt
Django==5.0.1
djangorestframework==3.14.0
django-cors-headers==4.3.1
celery==5.3.4
redis==5.0.1
psycopg2-binary==2.9.9
python-dotenv==1.0.0
openai==1.6.1
```

**데이터베이스 모델**:

```python
# projects/models.py
class Project(models.Model):
    STATUS_CHOICES = [
        ('pending', '대기중'),
        ('processing', '처리중'),
        ('completed', '완료'),
        ('failed', '실패'),
    ]
    
    name = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    requirements = models.JSONField()  # 설문 결과
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
class ProjectOutput(models.Model):
    project = models.ForeignKey(Project, on_delete=models.CASCADE)
    file_path = models.CharField(max_length=500)
    content = models.TextField()
    file_type = models.CharField(max_length=50)
    created_by_agent = models.CharField(max_length=100)
```

### 2.2 에이전트 시스템 아키텍처

**베이스 에이전트 클래스**:
```python
# agents/base_agent.py
from abc import ABC, abstractmethod

class BaseAgent(ABC):
    def __init__(self, project_id, context_manager):
        self.project_id = project_id
        self.context = context_manager
        self.status = 'idle'
        
    @abstractmethod
    async def execute(self):
        """에이전트의 주요 작업 실행"""
        pass
    
    @abstractmethod
    def get_dependencies(self):
        """이 에이전트가 의존하는 다른 에이전트 목록"""
        return []
    
    async def read_context(self, key):
        """공유 컨텍스트에서 데이터 읽기"""
        return await self.context.get(self.project_id, key)
    
    async def write_context(self, key, value):
        """공유 컨텍스트에 데이터 쓰기"""
        await self.context.set(self.project_id, key, value)
    
    async def update_status(self, status, message=None):
        """에이전트 상태 업데이트"""
        self.status = status
        await self.context.set(
            self.project_id,
            f'agent_{self.__class__.__name__}_status',
            {'status': status, 'message': message}
        )
```

**에이전트 오케스트레이터**:
```python
# agents/orchestrator.py
class AgentOrchestrator:
    def __init__(self, project_id):
        self.project_id = project_id
        self.agents = self._initialize_agents()
        
    def _initialize_agents(self):
        return {
            'requirement': RequirementAgent(self.project_id),
            'planning': PlanningAgent(self.project_id),
            'design': DesignAgent(self.project_id),
            'frontend': FrontendAgent(self.project_id),
            'backend': BackendAgent(self.project_id),
            'qa': QAAgent(self.project_id),
            'integration': IntegrationAgent(self.project_id),
        }
    
    async def execute_pipeline(self):
        """에이전트 파이프라인 실행"""
        # 1. 요구사항 해석
        await self.agents['requirement'].execute()
        
        # 2. 병렬 실행 (기획, 디자인)
        await asyncio.gather(
            self.agents['planning'].execute(),
            self.agents['design'].execute()
        )
        
        # 3. 병렬 실행 (프론트엔드, 백엔드)
        await asyncio.gather(
            self.agents['frontend'].execute(),
            self.agents['backend'].execute()
        )
        
        # 4. QA 검토
        await self.agents['qa'].execute()
        
        # 5. 통합
        await self.agents['integration'].execute()
```

### 2.3 OpenCode 통합 모듈

**OpenCode 클라이언트**:
```python
# opencode/client.py
class OpenCodeClient:
    def __init__(self, api_key):
        self.api_key = api_key
        self.base_url = "https://api.opencode.com/v1"
    
    async def generate_code(self, prompt, context=None):
        """코드 생성 요청"""
        payload = {
            'prompt': prompt,
            'context': context,
            'mode': 'code'
        }
        response = await self._make_request('/generate', payload)
        return response
    
    async def review_code(self, code, requirements):
        """코드 리뷰 요청"""
        payload = {
            'code': code,
            'requirements': requirements,
            'mode': 'review'
        }
        response = await self._make_request('/review', payload)
        return response
```

### 2.4 공유 컨텍스트 저장소

**Redis 기반 컨텍스트 매니저**:
```python
# context/manager.py
import redis.asyncio as redis
import json

class ContextManager:
    def __init__(self):
        self.redis = redis.from_url('redis://localhost:6379')
    
    async def get(self, project_id, key):
        """컨텍스트 데이터 조회"""
        full_key = f'project:{project_id}:{key}'
        value = await self.redis.get(full_key)
        return json.loads(value) if value else None
    
    async def set(self, project_id, key, value, ttl=3600):
        """컨텍스트 데이터 저장"""
        full_key = f'project:{project_id}:{key}'
        await self.redis.setex(
            full_key,
            ttl,
            json.dumps(value)
        )
    
    async def get_all(self, project_id):
        """프로젝트의 모든 컨텍스트 조회"""
        pattern = f'project:{project_id}:*'
        keys = await self.redis.keys(pattern)
        result = {}
        for key in keys:
            value = await self.redis.get(key)
            result[key.decode()] = json.loads(value)
        return result
```

### 2.5 REST API 엔드포인트

**주요 API**:
```python
# projects/views.py
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    @action(detail=False, methods=['post'])
    def create_from_survey(self, request):
        """설문 결과로 프로젝트 생성"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        project = serializer.save()
        
        # Celery 태스크로 에이전트 실행
        from .tasks import execute_agent_pipeline
        execute_agent_pipeline.delay(project.id)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """프로젝트 진행 상황 조회"""
        project = self.get_object()
        context = ContextManager()
        agent_statuses = await context.get_all(project.id)
        
        return Response({
            'project': ProjectSerializer(project).data,
            'agents': agent_statuses
        })
    
    @action(detail=True, methods=['get'])
    def outputs(self, request, pk=None):
        """프로젝트 산출물 조회"""
        project = self.get_object()
        outputs = ProjectOutput.objects.filter(project=project)
        
        return Response(
            ProjectOutputSerializer(outputs, many=True).data
        )
```

---

## Phase 3: 통합 및 테스트 (Week 5)

### 3.1 프론트엔드-백엔드 연동

**API 클라이언트 (Frontend)**:
```typescript
// lib/api-client.ts
export class APIClient {
  private baseURL = process.env.NEXT_PUBLIC_API_URL;
  
  async createProject(surveyData: SurveyData) {
    const response = await fetch(`${this.baseURL}/api/projects/create_from_survey/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(surveyData)
    });
    return response.json();
  }
  
  async getProjectStatus(projectId: string) {
    const response = await fetch(`${this.baseURL}/api/projects/${projectId}/status/`);
    return response.json();
  }
  
  async streamAgentUpdates(projectId: string, onUpdate: (data: any) => void) {
    const eventSource = new EventSource(
      `${this.baseURL}/api/projects/${projectId}/stream/`
    );
    
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onUpdate(data);
    };
    
    return eventSource;
  }
}
```

**실시간 업데이트 (WebSocket/SSE)**:
```python
# projects/consumers.py (Django Channels)
from channels.generic.websocket import AsyncWebsocketConsumer
import json

class ProjectConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.project_id = self.scope['url_route']['kwargs']['project_id']
        self.room_group_name = f'project_{self.project_id}'
        
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )
        await self.accept()
    
    async def agent_update(self, event):
        """에이전트 상태 업데이트 전송"""
        await self.send(text_data=json.dumps({
            'type': 'agent_update',
            'agent': event['agent'],
            'status': event['status'],
            'message': event['message']
        }))
```

### 3.2 테스트 시나리오

**E2E 테스트 플로우**:
1. 메인 페이지 접속
2. "새 프로젝트" 버튼 클릭
3. 설문 작성 (5단계)
4. 프로젝트 생성 확인
5. 대시보드에서 실시간 진행 상황 확인
6. 각 에이전트 카드 상태 변화 확인
7. 완료 후 결과물 다운로드
8. 파일 구조 검증

**단위 테스트**:
- 각 에이전트의 독립 실행 테스트
- 컨텍스트 매니저 CRUD 테스트
- API 엔드포인트 테스트
- UI 컴포넌트 렌더링 테스트

---

## 개발 우선순위 및 마일스톤

### Week 1: 프로젝트 설정 및 기본 UI
- [x] Next.js + Django 프로젝트 초기화
- [ ] 픽셀 아트 디자인 시스템 구축
- [ ] 메인 대시보드 UI 구현
- [ ] 설문 UI 구현

### Week 2: 에이전트 카드 및 시각화
- [ ] 부서별 에이전트 카드 UI
- [ ] 실시간 진행 상황 시각화
- [ ] 결과물 미리보기 UI
- [ ] 목 데이터로 전체 플로우 테스트

### Week 3: 백엔드 핵심 로직
- [ ] Django 모델 및 API 구현
- [ ] 베이스 에이전트 클래스 구현
- [ ] 에이전트 오케스트레이터 구현
- [ ] 공유 컨텍스트 저장소 구현

### Week 4: OpenCode 통합 및 에이전트 구현
- [ ] OpenCode 클라이언트 구현
- [ ] 7개 에이전트 개별 구현
- [ ] 병렬 실행 로직 구현
- [ ] Celery 태스크 설정

### Week 5: 통합 및 테스트
- [ ] 프론트엔드-백엔드 연동
- [ ] WebSocket/SSE 실시간 통신
- [ ] E2E 테스트
- [ ] 성능 최적화

---

## 기술적 고려사항

### 1. 에이전트 병렬 실행
- Celery를 사용한 비동기 태스크 처리
- Redis를 통한 에이전트 간 통신
- 의존성 그래프 기반 실행 순서 관리

### 2. 오류 처리 및 복구
- 각 에이전트의 독립적인 재시도 로직
- 부분 실패 시 다른 에이전트 계속 실행
- 사용자에게 명확한 오류 메시지 제공

### 3. 확장성
- 새로운 에이전트 추가 용이한 플러그인 구조
- 에이전트별 설정 파일 분리
- 다양한 프로젝트 템플릿 지원

### 4. 성능 최적화
- 에이전트 결과 캐싱
- 불필요한 재실행 방지
- 대용량 파일 처리 최적화

### 5. 보안
- API 키 안전한 관리
- 생성된 코드 샌드박스 실행
- 사용자 입력 검증 및 새니타이징

---

## UI/UX 세부 사항

### 픽셀 아트 스타일 가이드

**버튼 스타일**:
```css
.pixel-button {
  border: 4px solid #000;
  box-shadow: 4px 4px 0 #000;
  image-rendering: pixelated;
  transition: transform 0.1s;
}

.pixel-button:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 #000;
}

.pixel-button:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}
```

**캐릭터 스프라이트**:
- 각 부서별 고유 캐릭터 디자인
- 4방향 애니메이션 (idle, working, success, error)
- 16x16 또는 32x32 픽셀 크기
- 투명 배경 PNG 포맷

**사운드 효과** (선택사항):
- 버튼 클릭: 8비트 "삑" 소리
- 작업 완료: 레벨업 효과음
- 오류 발생: 경고음
- 배경음악: 레트로 게임 스타일 BGM

---

## 다음 단계

이 계획서를 검토하신 후, 다음 중 하나를 선택해주세요:

1. **계획 승인 및 개발 시작** - Code 모드로 전환하여 구현 시작
2. **계획 수정** - 특정 부분에 대한 변경 요청
3. **추가 질문** - 더 자세한 설명이 필요한 부분 질의

프로토타입 우선 접근 방식에 따라, Week 1-2의 UI 개발부터 시작하는 것을 권장합니다.