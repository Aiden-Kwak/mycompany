# 시스템 아키텍처 상세 설계

## 전체 시스템 구조

```mermaid
graph TB
    subgraph "Frontend - Next.js"
        UI[사장실 UI]
        Survey[설문 시스템]
        Dashboard[프로젝트 대시보드]
        AgentCards[에이전트 카드]
        Results[결과물 뷰어]
    end
    
    subgraph "API Layer"
        REST[REST API]
        WS[WebSocket/SSE]
    end
    
    subgraph "Backend - Django"
        API[Django REST Framework]
        Orchestrator[Agent Orchestrator]
        
        subgraph "Agents"
            REQ[Requirement Agent]
            PLAN[Planning Agent]
            DESIGN[Design Agent]
            FE[Frontend Agent]
            BE[Backend Agent]
            QA[QA Agent]
            INT[Integration Agent]
        end
        
        OpenCode[OpenCode Client]
        Context[Context Manager]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        Cache[(Redis)]
    end
    
    UI --> REST
    Survey --> REST
    Dashboard --> WS
    AgentCards --> WS
    Results --> REST
    
    REST --> API
    WS --> API
    
    API --> Orchestrator
    Orchestrator --> REQ
    Orchestrator --> PLAN
    Orchestrator --> DESIGN
    Orchestrator --> FE
    Orchestrator --> BE
    Orchestrator --> QA
    Orchestrator --> INT
    
    REQ --> OpenCode
    PLAN --> OpenCode
    DESIGN --> OpenCode
    FE --> OpenCode
    BE --> OpenCode
    QA --> OpenCode
    INT --> OpenCode
    
    REQ --> Context
    PLAN --> Context
    DESIGN --> Context
    FE --> Context
    BE --> Context
    QA --> Context
    INT --> Context
    
    API --> DB
    Context --> Cache
```

## 에이전트 실행 플로우

```mermaid
sequenceDiagram
    participant User
    participant UI
    participant API
    participant Orchestrator
    participant Agents
    participant OpenCode
    participant Context
    
    User->>UI: 설문 작성 완료
    UI->>API: POST /projects/create_from_survey
    API->>Orchestrator: 프로젝트 생성 및 실행 요청
    
    Orchestrator->>Agents: Requirement Agent 실행
    Agents->>OpenCode: 요구사항 해석 요청
    OpenCode-->>Agents: 해석 결과
    Agents->>Context: 공유 컨텍스트 저장
    
    par 병렬 실행 1단계
        Orchestrator->>Agents: Planning Agent 실행
        Orchestrator->>Agents: Design Agent 실행
    end
    
    Agents->>OpenCode: 기획/디자인 생성 요청
    OpenCode-->>Agents: 생성 결과
    Agents->>Context: 결과 저장
    Agents->>UI: WebSocket으로 상태 업데이트
    
    par 병렬 실행 2단계
        Orchestrator->>Agents: Frontend Agent 실행
        Orchestrator->>Agents: Backend Agent 실행
    end
    
    Agents->>Context: 기획/디자인 결과 조회
    Agents->>OpenCode: 코드 생성 요청
    OpenCode-->>Agents: 생성된 코드
    Agents->>Context: 코드 저장
    Agents->>UI: 진행 상황 업데이트
    
    Orchestrator->>Agents: QA Agent 실행
    Agents->>Context: 모든 산출물 조회
    Agents->>OpenCode: 코드 리뷰 요청
    OpenCode-->>Agents: 리뷰 결과
    Agents->>Context: 개선 사항 저장
    
    Orchestrator->>Agents: Integration Agent 실행
    Agents->>Context: 모든 결과 통합
    Agents->>API: 최종 산출물 저장
    API->>UI: 완료 알림
    UI->>User: 결과물 표시
```

## 에이전트 의존성 그래프

```mermaid
graph LR
    REQ[Requirement<br/>Agent]
    PLAN[Planning<br/>Agent]
    DESIGN[Design<br/>Agent]
    FE[Frontend<br/>Agent]
    BE[Backend<br/>Agent]
    QA[QA<br/>Agent]
    INT[Integration<br/>Agent]
    
    REQ --> PLAN
    REQ --> DESIGN
    
    PLAN --> FE
    PLAN --> BE
    DESIGN --> FE
    
    FE --> QA
    BE --> QA
    
    QA --> INT
    PLAN --> INT
    DESIGN --> INT
```

## 데이터 모델 ERD

```mermaid
erDiagram
    PROJECT ||--o{ PROJECT_OUTPUT : has
    PROJECT ||--o{ AGENT_STATUS : tracks
    PROJECT ||--|| PROJECT_CONTEXT : contains
    
    PROJECT {
        uuid id PK
        string name
        text description
        json requirements
        string status
        datetime created_at
        datetime completed_at
    }
    
    PROJECT_OUTPUT {
        uuid id PK
        uuid project_id FK
        string file_path
        text content
        string file_type
        string created_by_agent
        datetime created_at
    }
    
    AGENT_STATUS {
        uuid id PK
        uuid project_id FK
        string agent_name
        string status
        text message
        int progress
        datetime updated_at
    }
    
    PROJECT_CONTEXT {
        uuid id PK
        uuid project_id FK
        json shared_data
        json agent_outputs
        datetime updated_at
    }
```

## 컴포넌트 구조 (Frontend)

```mermaid
graph TD
    App[App Layout]
    
    App --> Home[Home Page]
    App --> NewProject[New Project Page]
    App --> ProjectDetail[Project Detail Page]
    App --> Results[Results Page]
    
    Home --> CEODesk[CEO Desk Component]
    Home --> DepartmentGrid[Department Grid]
    Home --> ProjectList[Project List]
    
    NewProject --> SurveyForm[Survey Form]
    SurveyForm --> StepIndicator[Step Indicator]
    SurveyForm --> ChecklistInput[Checklist Input]
    
    ProjectDetail --> ProgressBar[Progress Bar]
    ProjectDetail --> AgentCards[Agent Cards Grid]
    ProjectDetail --> Timeline[Timeline View]
    ProjectDetail --> LogStream[Log Stream]
    
    AgentCards --> AgentCard[Agent Card]
    AgentCard --> PixelCharacter[Pixel Character]
    AgentCard --> StatusBadge[Status Badge]
    AgentCard --> OutputPreview[Output Preview]
    
    Results --> FileTree[File Tree]
    Results --> CodeViewer[Code Viewer]
    Results --> DownloadButton[Download Button]
```

## 상태 관리 플로우

```mermaid
stateDiagram-v2
    [*] --> Idle: 프로젝트 생성
    
    Idle --> RequirementAnalysis: 설문 제출
    RequirementAnalysis --> Planning: 요구사항 해석 완료
    
    Planning --> Designing: 기획 완료
    Planning --> Developing: 기획 완료
    Designing --> Developing: 디자인 완료
    
    Developing --> QAReview: 개발 완료
    QAReview --> Integration: 리뷰 완료
    QAReview --> Developing: 수정 필요
    
    Integration --> Completed: 통합 완료
    
    RequirementAnalysis --> Failed: 오류 발생
    Planning --> Failed: 오류 발생
    Designing --> Failed: 오류 발생
    Developing --> Failed: 오류 발생
    QAReview --> Failed: 오류 발생
    Integration --> Failed: 오류 발생
    
    Failed --> Idle: 재시도
    Completed --> [*]
```

## API 엔드포인트 구조

### REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/` | 프로젝트 목록 조회 |
| POST | `/api/projects/` | 프로젝트 생성 |
| GET | `/api/projects/{id}/` | 프로젝트 상세 조회 |
| POST | `/api/projects/create_from_survey/` | 설문으로 프로젝트 생성 |
| GET | `/api/projects/{id}/status/` | 프로젝트 진행 상황 |
| GET | `/api/projects/{id}/outputs/` | 프로젝트 산출물 목록 |
| GET | `/api/projects/{id}/download/` | 전체 산출물 다운로드 |
| POST | `/api/projects/{id}/regenerate/` | 특정 부서 재실행 |
| GET | `/api/agents/` | 에이전트 목록 |
| GET | `/api/agents/{name}/status/` | 에이전트 상태 조회 |

### WebSocket

| Event | Direction | Description |
|-------|-----------|-------------|
| `connect` | Client → Server | 프로젝트 구독 시작 |
| `agent_update` | Server → Client | 에이전트 상태 업데이트 |
| `progress_update` | Server → Client | 전체 진행률 업데이트 |
| `output_created` | Server → Client | 새 산출물 생성 알림 |
| `error` | Server → Client | 오류 발생 알림 |
| `completed` | Server → Client | 프로젝트 완료 알림 |

## 보안 고려사항

```mermaid
graph TB
    subgraph "보안 레이어"
        Auth[인증/인가]
        RateLimit[Rate Limiting]
        Validation[입력 검증]
        Sanitize[코드 새니타이징]
    end
    
    subgraph "실행 환경"
        Sandbox[샌드박스 환경]
        ResourceLimit[리소스 제한]
        Timeout[타임아웃 설정]
    end
    
    User[사용자] --> Auth
    Auth --> RateLimit
    RateLimit --> Validation
    Validation --> API[API Layer]
    
    API --> Sanitize
    Sanitize --> Sandbox
    Sandbox --> ResourceLimit
    ResourceLimit --> Timeout
    Timeout --> Execution[코드 실행]
```

## 확장 가능성

### 플러그인 아키텍처

```mermaid
graph LR
    Core[Core System]
    
    Core --> PluginManager[Plugin Manager]
    
    PluginManager --> SecurityPlugin[Security Plugin]
    PluginManager --> PerformancePlugin[Performance Plugin]
    PluginManager --> LegalPlugin[Legal Plugin]
    PluginManager --> CustomAgent[Custom Agent Plugin]
    
    SecurityPlugin --> AgentHook[Agent Hooks]
    PerformancePlugin --> AgentHook
    LegalPlugin --> AgentHook
    CustomAgent --> AgentHook
```

### 템플릿 시스템

```mermaid
graph TD
    TemplateEngine[Template Engine]
    
    TemplateEngine --> WebApp[Web App Template]
    TemplateEngine --> MobileApp[Mobile App Template]
    TemplateEngine --> API[API Template]
    TemplateEngine --> Dashboard[Dashboard Template]
    
    WebApp --> React[React Variant]
    WebApp --> Vue[Vue Variant]
    WebApp --> Next[Next.js Variant]
    
    MobileApp --> ReactNative[React Native]
    MobileApp --> Flutter[Flutter]
```

## 성능 최적화 전략

### 캐싱 전략

```mermaid
graph LR
    Request[요청]
    
    Request --> L1[L1: 메모리 캐시]
    L1 --> L2[L2: Redis 캐시]
    L2 --> L3[L3: 데이터베이스]
    
    L1 -.TTL: 5분.-> L1
    L2 -.TTL: 1시간.-> L2
    L3 -.영구 저장.-> L3
```

### 병렬 처리 최적화

```mermaid
graph TB
    Orchestrator[Orchestrator]
    
    Orchestrator --> Queue1[Queue 1: High Priority]
    Orchestrator --> Queue2[Queue 2: Normal Priority]
    Orchestrator --> Queue3[Queue 3: Low Priority]
    
    Queue1 --> Worker1[Worker Pool 1]
    Queue2 --> Worker2[Worker Pool 2]
    Queue3 --> Worker3[Worker Pool 3]
    
    Worker1 --> Result[Result Aggregator]
    Worker2 --> Result
    Worker3 --> Result
```

## 모니터링 및 로깅

```mermaid
graph TB
    subgraph "Application"
        App[Application Code]
        Logger[Logger]
    end
    
    subgraph "Monitoring Stack"
        Metrics[Metrics Collector]
        Logs[Log Aggregator]
        Traces[Trace Collector]
    end
    
    subgraph "Visualization"
        Dashboard[Monitoring Dashboard]
        Alerts[Alert Manager]
    end
    
    App --> Logger
    Logger --> Metrics
    Logger --> Logs
    Logger --> Traces
    
    Metrics --> Dashboard
    Logs --> Dashboard
    Traces --> Dashboard
    
    Dashboard --> Alerts
```

## 배포 아키텍처

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer]
        
        subgraph "Frontend Cluster"
            Next1[Next.js Instance 1]
            Next2[Next.js Instance 2]
            Next3[Next.js Instance 3]
        end
        
        subgraph "Backend Cluster"
            Django1[Django Instance 1]
            Django2[Django Instance 2]
            Django3[Django Instance 3]
        end
        
        subgraph "Worker Cluster"
            Celery1[Celery Worker 1]
            Celery2[Celery Worker 2]
            Celery3[Celery Worker 3]
        end
        
        subgraph "Data Layer"
            PG[(PostgreSQL Primary)]
            PGReplica[(PostgreSQL Replica)]
            RedisCluster[(Redis Cluster)]
        end
    end
    
    LB --> Next1
    LB --> Next2
    LB --> Next3
    
    Next1 --> Django1
    Next2 --> Django2
    Next3 --> Django3
    
    Django1 --> PG
    Django2 --> PG
    Django3 --> PG
    
    Django1 --> RedisCluster
    Django2 --> RedisCluster
    Django3 --> RedisCluster
    
    Celery1 --> RedisCluster
    Celery2 --> RedisCluster
    Celery3 --> RedisCluster
    
    PG --> PGReplica
```

## 개발 환경 설정

### Docker Compose 구조

```yaml
services:
  frontend:
    - Next.js Development Server
    - Hot Reload
    - Port: 3000
  
  backend:
    - Django Development Server
    - Auto Reload
    - Port: 8000
  
  postgres:
    - PostgreSQL 15
    - Port: 5432
  
  redis:
    - Redis 7
    - Port: 6379
  
  celery:
    - Celery Worker
    - Celery Beat
```

이 아키텍처는 확장 가능하고 유지보수가 용이하며, 각 컴포넌트가 독립적으로 개발 및 배포될 수 있도록 설계되었습니다.