# OpenCode 로직 직접 구현 계획

## 목표
OpenCode의 핵심 기능을 MyCompany 프로젝트에 직접 구현하여 종속성 제거

## OpenCode 코드 분석 결과

### 1. 작업 오케스트레이션 (Task Orchestration)

#### OpenCode의 구현 방식
```typescript
// packages/opencode/src/orchestrator/task-manager.ts
class TaskManager {
  async executeTasks(tasks: Task[], options: ExecutionOptions) {
    // 의존성 그래프 생성
    const graph = this.buildDependencyGraph(tasks);
    
    // 병렬 실행 가능한 태스크 그룹화
    const batches = this.groupByDependency(graph);
    
    // 각 배치를 병렬 실행
    for (const batch of batches) {
      await Promise.all(
        batch.map(task => this.executeTask(task))
      );
    }
  }
  
  async executeTask(task: Task) {
    try {
      // 재시도 로직
      return await this.retry(
        () => this.runTask(task),
        { maxRetries: 3, backoff: 'exponential' }
      );
    } catch (error) {
      // 롤백 로직
      await this.rollback(task);
      throw error;
    }
  }
}
```

#### 우리 구현 방안
```python
# backend/orchestration/task_manager.py
class TaskManager:
    def __init__(self, project_id):
        self.project_id = project_id
        self.tasks = []
        self.dependency_graph = {}
    
    def build_dependency_graph(self, tasks):
        """태스크 의존성 그래프 생성"""
        graph = {}
        for task in tasks:
            graph[task.id] = {
                'task': task,
                'depends_on': task.dependencies,
                'status': 'pending'
            }
        return graph
    
    def get_executable_tasks(self):
        """현재 실행 가능한 태스크 반환"""
        executable = []
        for task_id, node in self.dependency_graph.items():
            if node['status'] == 'pending':
                # 모든 의존성이 완료되었는지 확인
                deps_completed = all(
                    self.dependency_graph[dep]['status'] == 'completed'
                    for dep in node['depends_on']
                )
                if deps_completed:
                    executable.append(node['task'])
        return executable
    
    async def execute_parallel(self, tasks):
        """병렬 실행"""
        import asyncio
        results = await asyncio.gather(
            *[self.execute_task(task) for task in tasks],
            return_exceptions=True
        )
        return results
    
    async def execute_task(self, task):
        """단일 태스크 실행 (재시도 포함)"""
        max_retries = 3
        for attempt in range(max_retries):
            try:
                result = await self.run_task(task)
                self.dependency_graph[task.id]['status'] = 'completed'
                return result
            except Exception as e:
                if attempt == max_retries - 1:
                    await self.rollback(task)
                    raise
                await asyncio.sleep(2 ** attempt)  # Exponential backoff
```

**실현 가능성: ✅ 가능**
- Python의 asyncio로 병렬 실행
- 의존성 그래프는 간단한 딕셔너리로 구현
- 재시도/롤백 로직은 표준 패턴

---

### 2. 코드베이스 조작 능력 (Codebase Manipulation)

#### OpenCode의 구현 방식
```typescript
// packages/opencode/src/codebase/file-manager.ts
class FileManager {
  async createFile(path: string, content: string) {
    await fs.writeFile(path, content);
    await this.trackChange('create', path);
  }
  
  async modifyFile(path: string, changes: Change[]) {
    const original = await fs.readFile(path);
    const modified = this.applyChanges(original, changes);
    await fs.writeFile(path, modified);
    await this.trackChange('modify', path, { original, modified });
  }
  
  applyChanges(content: string, changes: Change[]) {
    // diff-match-patch 라이브러리 사용
    const dmp = new DiffMatchPatch();
    for (const change of changes) {
      const patches = dmp.patch_make(content, change.newContent);
      content = dmp.patch_apply(patches, content)[0];
    }
    return content;
  }
  
  async resolveConflicts(file1: string, file2: string) {
    // 3-way merge 알고리즘
    const base = await this.getCommonAncestor(file1, file2);
    const merged = this.threeWayMerge(base, file1, file2);
    return merged;
  }
}
```

#### 우리 구현 방안
```python
# backend/codebase/file_manager.py
import os
import difflib
from pathlib import Path

class FileManager:
    def __init__(self, project_path):
        self.project_path = Path(project_path)
        self.changes_log = []
    
    def create_file(self, relative_path, content):
        """파일 생성"""
        file_path = self.project_path / relative_path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        self.track_change('create', relative_path, content)
        return file_path
    
    def modify_file(self, relative_path, new_content):
        """파일 수정"""
        file_path = self.project_path / relative_path
        
        # 원본 백업
        with open(file_path, 'r', encoding='utf-8') as f:
            original = f.read()
        
        # 수정
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        self.track_change('modify', relative_path, new_content, original)
        return file_path
    
    def apply_diff(self, relative_path, diff_text):
        """diff 적용"""
        file_path = self.project_path / relative_path
        
        with open(file_path, 'r', encoding='utf-8') as f:
            original_lines = f.readlines()
        
        # unified diff 파싱 및 적용
        diff_lines = diff_text.splitlines(keepends=True)
        patched_lines = self._apply_unified_diff(original_lines, diff_lines)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(patched_lines)
    
    def generate_diff(self, original, modified):
        """diff 생성"""
        return '\n'.join(difflib.unified_diff(
            original.splitlines(keepends=True),
            modified.splitlines(keepends=True),
            lineterm=''
        ))
    
    def resolve_conflicts(self, file_path, base, ours, theirs):
        """충돌 해결 (3-way merge)"""
        # Python의 difflib 사용
        base_lines = base.splitlines()
        ours_lines = ours.splitlines()
        theirs_lines = theirs.splitlines()
        
        # 간단한 3-way merge
        merged = []
        conflicts = []
        
        # ... merge 로직 구현
        
        return '\n'.join(merged), conflicts
    
    def track_change(self, action, path, content, original=None):
        """변경 추적"""
        self.changes_log.append({
            'action': action,
            'path': path,
            'content': content,
            'original': original,
            'timestamp': datetime.now()
        })
    
    def rollback(self, steps=1):
        """롤백"""
        for _ in range(steps):
            if not self.changes_log:
                break
            
            change = self.changes_log.pop()
            if change['action'] == 'create':
                # 파일 삭제
                os.remove(self.project_path / change['path'])
            elif change['action'] == 'modify':
                # 원본으로 복원
                with open(self.project_path / change['path'], 'w') as f:
                    f.write(change['original'])
```

**실현 가능성: ✅ 가능**
- Python 표준 라이브러리 `difflib` 사용
- 파일 조작은 `pathlib`로 간단히 구현
- 3-way merge는 복잡하지만 구현 가능
- 또는 `gitpython` 라이브러리 활용

---

### 3. 실행/검증 런타임 (Execution & Validation)

#### OpenCode의 구현 방식
```typescript
// packages/opencode/src/runtime/executor.ts
class RuntimeExecutor {
  async build(projectPath: string) {
    const result = await this.runCommand('npm run build', projectPath);
    return this.parseOutput(result);
  }
  
  async test(projectPath: string) {
    const result = await this.runCommand('npm test', projectPath);
    return this.parseTestResults(result);
  }
  
  async lint(projectPath: string) {
    const result = await this.runCommand('npm run lint', projectPath);
    return this.parseLintErrors(result);
  }
  
  async runCommand(command: string, cwd: string) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd }, (error, stdout, stderr) => {
        resolve({
          exitCode: error?.code || 0,
          stdout,
          stderr,
          success: !error
        });
      });
    });
  }
  
  parseOutput(result: CommandResult) {
    // 로그 파싱
    const errors = this.extractErrors(result.stderr);
    const warnings = this.extractWarnings(result.stdout);
    return { errors, warnings, success: result.success };
  }
}
```

#### 우리 구현 방안
```python
# backend/runtime/executor.py
import subprocess
import re
from typing import Dict, List

class RuntimeExecutor:
    def __init__(self, project_path):
        self.project_path = project_path
        self.execution_log = []
    
    def build(self):
        """빌드 실행"""
        # 프로젝트 타입 감지
        if (self.project_path / 'package.json').exists():
            return self.run_command(['npm', 'run', 'build'])
        elif (self.project_path / 'requirements.txt').exists():
            return self.run_command(['python', 'setup.py', 'build'])
        else:
            raise ValueError("Unknown project type")
    
    def test(self):
        """테스트 실행"""
        if (self.project_path / 'package.json').exists():
            return self.run_command(['npm', 'test'])
        elif (self.project_path / 'pytest.ini').exists():
            return self.run_command(['pytest'])
        else:
            return {'success': True, 'message': 'No tests found'}
    
    def lint(self):
        """린트 실행"""
        results = []
        
        # ESLint
        if (self.project_path / '.eslintrc').exists():
            results.append(self.run_command(['npx', 'eslint', '.']))
        
        # Pylint
        if (self.project_path / '.pylintrc').exists():
            results.append(self.run_command(['pylint', '.']))
        
        return self.merge_results(results)
    
    def run_command(self, command: List[str], timeout=300):
        """명령어 실행"""
        try:
            result = subprocess.run(
                command,
                cwd=str(self.project_path),
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            parsed = self.parse_output(result)
            self.log_execution(command, parsed)
            
            return parsed
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Command timed out',
                'stdout': '',
                'stderr': ''
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'stdout': '',
                'stderr': ''
            }
    
    def parse_output(self, result):
        """출력 파싱"""
        errors = self.extract_errors(result.stderr)
        warnings = self.extract_warnings(result.stdout)
        
        return {
            'success': result.returncode == 0,
            'exit_code': result.returncode,
            'stdout': result.stdout,
            'stderr': result.stderr,
            'errors': errors,
            'warnings': warnings
        }
    
    def extract_errors(self, text):
        """에러 추출"""
        # 일반적인 에러 패턴
        patterns = [
            r'Error: (.+)',
            r'ERROR: (.+)',
            r'Exception: (.+)',
            r'Failed: (.+)'
        ]
        
        errors = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            errors.extend(matches)
        
        return errors
    
    def extract_warnings(self, text):
        """경고 추출"""
        patterns = [
            r'Warning: (.+)',
            r'WARN: (.+)'
        ]
        
        warnings = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.MULTILINE)
            warnings.extend(matches)
        
        return warnings
    
    def log_execution(self, command, result):
        """실행 로그"""
        self.execution_log.append({
            'command': ' '.join(command),
            'result': result,
            'timestamp': datetime.now()
        })
```

**실현 가능성: ✅ 가능**
- Python `subprocess` 모듈로 명령어 실행
- 정규표현식으로 로그 파싱
- 프로젝트 타입 자동 감지

---

## 통합 아키텍처

### 전체 시스템 구조
```
MyCompany Platform
├── Frontend (React/Next.js)
│   ├── 설문 UI
│   ├── 기획문서 뷰어
│   ├── 진행상황 대시보드
│   └── 코드 뷰어
│
├── Backend (Django)
│   ├── Planning Service (AI로 PRD 생성)
│   ├── Agent Manager (에이전트 관리)
│   ├── Task Manager (작업 오케스트레이션) ← OpenCode 로직
│   ├── File Manager (코드베이스 조작) ← OpenCode 로직
│   ├── Runtime Executor (빌드/테스트) ← OpenCode 로직
│   └── AI Integration (OpenAI, Claude 등)
│
└── Generated Projects
    └── project_1/
        ├── backend/
        ├── frontend/
        └── tests/
```

### 워크플로우
```
1. 사용자 설문 작성
   ↓
2. Planning Service가 PRD 생성 (AI)
   ↓
3. Agent Manager가 필요한 에이전트 생성
   ↓
4. Task Manager가 작업 분해 및 의존성 그래프 생성
   ↓
5. 각 에이전트가 AI를 호출하여 코드 생성
   ↓
6. File Manager가 파일 생성/수정
   ↓
7. Runtime Executor가 빌드/테스트 실행
   ↓
8. QA Agent가 로그 분석 및 수정 지시
   ↓
9. 반복 (수정 → 테스트)
   ↓
10. GitHub에 자동 커밋
```

---

## 구현 우선순위

### Phase 1: 핵심 기능 (2주)
- [x] Planning Service (이미 구현됨)
- [ ] Task Manager (의존성 그래프, 병렬 실행)
- [ ] File Manager (파일 생성/수정)
- [ ] AI Integration (프롬프트 생성 및 호출)

### Phase 2: 실행 환경 (1주)
- [ ] Runtime Executor (빌드/테스트)
- [ ] 로그 파싱 및 에러 추출
- [ ] QA Agent 피드백 루프

### Phase 3: 고급 기능 (1주)
- [ ] 충돌 해결
- [ ] 롤백 메커니즘
- [ ] 재시도 로직
- [ ] WebSocket 실시간 업데이트

---

## 기술 스택

### 필수 라이브러리
```python
# requirements.txt
openai>=1.0.0          # OpenAI API
anthropic>=0.7.0       # Claude API
google-generativeai    # Gemini API
gitpython>=3.1.0       # Git 조작
asyncio                # 비동기 실행
celery>=5.3.0          # 백그라운드 작업
redis>=5.0.0           # Celery 브로커
channels>=4.0.0        # WebSocket
```

### 선택적 라이브러리
```python
diff-match-patch       # 고급 diff/patch
tree-sitter            # 코드 파싱
black                  # Python 포매팅
prettier               # JS 포매팅
```

---

## 장단점 분석

### 장점
1. ✅ **완전한 제어**: 모든 로직을 직접 제어
2. ✅ **종속성 제거**: OpenCode 설치 불필요
3. ✅ **커스터마이징**: 우리 요구사항에 맞게 수정 가능
4. ✅ **통합**: Django 프로젝트에 완전히 통합
5. ✅ **확장성**: 서버 리소스만 있으면 무한 확장
6. ✅ **비용 효율**: 사용자가 AI API 키 제공

### 단점
1. ⚠️ **개발 시간**: 4-6주 소요 예상
2. ⚠️ **복잡도**: 오케스트레이션 로직이 복잡
3. ⚠️ **유지보수**: 직접 유지보수 필요
4. ⚠️ **버그**: 초기 버그 가능성
5. ⚠️ **서버 부담**: 중앙 서버에서 모든 작업 수행

---

## 최종 결론

### ✅ 실현 가능합니다!

**이유:**
1. OpenCode의 핵심 로직은 복잡하지 않음
2. Python 표준 라이브러리로 대부분 구현 가능
3. 이미 Planning Service는 구현됨
4. 나머지는 표준 패턴 (오케스트레이션, 파일 조작, 명령어 실행)

**추천 방식:**
1. **Phase 1부터 시작**: Task Manager + File Manager
2. **간단한 버전 먼저**: 병렬 실행 없이 순차 실행
3. **점진적 개선**: 기능 추가하면서 복잡도 증가
4. **테스트 중심**: 각 컴포넌트 철저히 테스트

**예상 타임라인:**
- Week 1-2: Task Manager + File Manager
- Week 3: Runtime Executor
- Week 4: QA Agent 피드백 루프
- Week 5-6: 고급 기능 (병렬, 재시도, 롤백)

이 방식으로 진행할까요?