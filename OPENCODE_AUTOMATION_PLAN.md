# OpenCode Automation Implementation Plan

## 목표
설문 데이터를 기반으로 자동으로 기획문서를 작성하고, 에이전트를 생성하여 OpenCode로 병렬 작업을 수행하는 완전 자동화 시스템 구축

## 시스템 아키텍처

```
Survey Data → Planning Document Generator → Agent Auto-Creator → Task Orchestrator → OpenCode Parallel Execution
     ↓                    ↓                         ↓                    ↓                      ↓
Requirements        PRD Document              Agents Created        Tasks Assigned        Code Generated
```

## Phase 1: OpenCode Client Implementation

### 1.1 OpenCode API Wrapper
**File**: `backend/opencode/client.py`

기능:
- OpenCode API 연결
- 모델 목록 조회
- 코드 생성 요청
- 스트리밍 응답 처리
- 에러 핸들링

### 1.2 Model Configuration
**File**: `backend/opencode/models.py`

기능:
- 사용 가능한 모델 목록 관리
- 모델별 특성 정의 (속도, 품질, 비용)
- 작업 유형별 추천 모델

## Phase 2: Planning Document Generator

### 2.1 Requirement Analyzer
**File**: `backend/planning/requirement_analyzer.py`

입력: ProjectRequirement 객체들
출력: 구조화된 요구사항 분석

기능:
- 설문 답변 분석
- 기능 요구사항 추출
- 기술 스택 추천
- 우선순위 결정

### 2.2 PRD Generator
**File**: `backend/planning/prd_generator.py`

입력: 분석된 요구사항
출력: Product Requirements Document (PRD)

PRD 구조:
```markdown
# Project: [프로젝트명]

## 1. Executive Summary
- 프로젝트 개요
- 목표
- 주요 기능

## 2. Technical Requirements
- 기술 스택
- 아키텍처
- 데이터베이스 설계

## 3. Feature Specifications
- 기능별 상세 명세
- 사용자 플로우
- API 엔드포인트

## 4. Development Plan
- 필요한 에이전트 역할
- 작업 분할
- 의존성 관계

## 5. Timeline & Milestones
```

### 2.3 Technical Spec Generator
**File**: `backend/planning/tech_spec_generator.py`

기능:
- 아키텍처 다이어그램 생성
- 데이터베이스 스키마 설계
- API 명세 작성
- 파일 구조 제안

## Phase 3: Automatic Agent Creation

### 3.1 Agent Role Analyzer
**File**: `backend/agents/role_analyzer.py`

입력: PRD 문서
출력: 필요한 에이전트 목록

분석 기준:
- 프로젝트 복잡도
- 기술 스택
- 기능 범위
- 팀 구성 최적화

### 3.2 Agent Factory
**File**: `backend/agents/agent_factory.py`

기능:
- PRD 기반 에이전트 자동 생성
- 역할 및 스킬 할당
- 에이전트 간 협업 관계 설정
- OpenCode 모델 할당

에이전트 타입:
```python
AGENT_TEMPLATES = {
    'product_manager': {
        'avatar': '📋',
        'skills': ['requirement_analysis', 'feature_planning', 'user_story'],
        'model': 'gpt-4',  # 높은 이해력 필요
    },
    'ui_ux_designer': {
        'avatar': '🎨',
        'skills': ['ui_design', 'ux_flow', 'wireframe'],
        'model': 'claude-3-opus',  # 창의성 필요
    },
    'frontend_developer': {
        'avatar': '💻',
        'skills': ['react', 'typescript', 'css', 'api_integration'],
        'model': 'gpt-4-turbo',  # 코드 생성
    },
    'backend_developer': {
        'avatar': '⚙️',
        'skills': ['python', 'django', 'api', 'database'],
        'model': 'gpt-4-turbo',  # 코드 생성
    },
    'qa_engineer': {
        'avatar': '🔍',
        'skills': ['testing', 'debugging', 'code_review'],
        'model': 'gpt-4',  # 분석력 필요
    },
}
```

## Phase 4: Task Orchestrator

### 4.1 Task Generator
**File**: `backend/tasks/task_generator.py`

입력: PRD + 생성된 에이전트들
출력: 작업 목록 및 의존성 그래프

기능:
- PRD를 실행 가능한 태스크로 분할
- 에이전트별 작업 할당
- 의존성 관계 설정
- 우선순위 결정

### 4.2 Parallel Executor
**File**: `backend/tasks/parallel_executor.py`

기능:
- Celery를 사용한 병렬 작업 실행
- 의존성 기반 작업 스케줄링
- 실시간 진행 상황 추적
- 에러 처리 및 재시도

작업 흐름:
```python
# 1. 의존성 없는 작업들을 병렬로 시작
parallel_tasks = [
    'PM: 기능 명세 작성',
    'Designer: UI 설계',
]

# 2. 완료 후 다음 단계 실행
sequential_tasks = [
    'Frontend Dev: 컴포넌트 구현',  # UI 설계 완료 후
    'Backend Dev: API 구현',        # 기능 명세 완료 후
]

# 3. 통합 작업
integration_tasks = [
    'QA: 통합 테스트',  # 모든 개발 완료 후
]
```

### 4.3 Progress Tracker
**File**: `backend/tasks/progress_tracker.py`

기능:
- WebSocket을 통한 실시간 진행 상황 전송
- 작업 완료율 계산
- 예상 완료 시간 계산
- 로그 스트리밍

## Phase 5: OpenCode Integration

### 5.1 OpenCode Task Executor
**File**: `backend/opencode/task_executor.py`

기능:
- 태스크를 OpenCode 프롬프트로 변환
- 컨텍스트 관리 (이전 작업 결과 포함)
- 스트리밍 응답 처리
- 결과 검증 및 저장

프롬프트 구조:
```python
def build_prompt(task, context):
    return f"""
    Role: {task.agent.role}
    Task: {task.title}
    
    Context:
    - Project: {task.project.name}
    - Requirements: {task.project.requirements}
    - Previous Work: {context.previous_outputs}
    
    Instructions:
    {task.description}
    
    Expected Output:
    - Type: {task.expected_output_type}
    - Format: {task.output_format}
    """
```

### 5.2 Model Selection UI
**File**: `frontend/components/opencode/ModelSelector.tsx`

기능:
- 사용 가능한 모델 목록 표시
- 모델별 특성 비교 (속도/품질/비용)
- 프로젝트별 모델 설정
- 에이전트별 모델 커스터마이징

UI 구조:
```typescript
interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'google';
  speed: 'fast' | 'medium' | 'slow';
  quality: 'high' | 'medium' | 'low';
  cost: 'high' | 'medium' | 'low';
  recommended_for: string[];
}
```

### 5.3 Context Manager
**File**: `backend/opencode/context_manager.py`

기능:
- 프로젝트 컨텍스트 관리
- 에이전트 간 정보 공유
- 작업 결과 캐싱
- 컨텍스트 크기 최적화

## Implementation Order

### Week 1: Foundation
1. ✅ OpenCode client wrapper
2. ✅ Model configuration
3. ✅ API key management UI

### Week 2: Planning System
4. ✅ Requirement analyzer
5. ✅ PRD generator
6. ✅ Technical spec generator

### Week 3: Agent Automation
7. ✅ Agent role analyzer
8. ✅ Agent factory
9. ✅ Agent auto-creation API

### Week 4: Task Orchestration
10. ✅ Task generator
11. ✅ Parallel executor with Celery
12. ✅ Progress tracker with WebSocket

### Week 5: Integration & Testing
13. ✅ End-to-end workflow
14. ✅ Model selection UI
15. ✅ Real-time monitoring dashboard

## API Endpoints

### Planning
- `POST /api/projects/{id}/generate-prd/` - PRD 생성
- `GET /api/projects/{id}/prd/` - PRD 조회

### Agent Management
- `POST /api/projects/{id}/auto-create-agents/` - 에이전트 자동 생성
- `GET /api/projects/{id}/agents/` - 에이전트 목록

### Task Orchestration
- `POST /api/projects/{id}/start-development/` - 개발 시작
- `GET /api/projects/{id}/progress/` - 진행 상황
- `WS /ws/projects/{id}/` - 실시간 업데이트

### OpenCode
- `GET /api/opencode/models/` - 사용 가능한 모델 목록
- `POST /api/opencode/execute/` - OpenCode 실행
- `GET /api/projects/{id}/model-config/` - 프로젝트 모델 설정

## Database Schema Updates

### PlanningDocument Model
```python
class PlanningDocument(models.Model):
    project = models.OneToOneField(Project, on_delete=models.CASCADE)
    executive_summary = models.TextField()
    technical_requirements = models.JSONField()
    feature_specifications = models.JSONField()
    development_plan = models.JSONField()
    timeline = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)
```

### AgentModelConfig Model
```python
class AgentModelConfig(models.Model):
    agent = models.OneToOneField(Agent, on_delete=models.CASCADE)
    model_id = models.CharField(max_length=100)
    temperature = models.FloatField(default=0.7)
    max_tokens = models.IntegerField(default=2000)
    custom_instructions = models.TextField(blank=True)
```

### TaskExecution Model
```python
class TaskExecution(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True)
    status = models.CharField(max_length=20)
    model_used = models.CharField(max_length=100)
    tokens_used = models.IntegerField(default=0)
    execution_log = models.TextField()
```

## Success Metrics

1. **Automation Rate**: 설문 → 완성된 코드까지 자동화 비율
2. **Time to First Code**: 프로젝트 시작부터 첫 코드 생성까지 시간
3. **Parallel Efficiency**: 병렬 처리로 인한 시간 단축률
4. **Code Quality**: 생성된 코드의 품질 점수
5. **User Satisfaction**: 사용자 만족도

## Next Steps

1. OpenCode API 키 확인 및 연결 테스트
2. OpenCode client wrapper 구현
3. Planning document generator 구현
4. Agent auto-creation 시스템 구현
5. Task orchestrator 구현
6. 전체 플로우 통합 테스트