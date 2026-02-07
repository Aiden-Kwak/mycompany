"""
OpenCode Orchestrator
Manages the entire project development workflow using OpenCode
"""
from typing import Dict, List
from pathlib import Path
import os

from projects.models import Project
from agents.models import Agent
from tasks.models import Task, TaskOutput, OutputFile
from planning.models import PlanningDocument
from .executor import OpenCodeExecutor, create_task_prompt


class ProjectOrchestrator:
    """Orchestrates project development using OpenCode"""
    
    def __init__(self, project: Project):
        self.project = project
        self.project_dir = self._get_project_directory()
        self.executor = OpenCodeExecutor(self.project_dir)
    
    def _get_project_directory(self) -> str:
        """Get or create project directory"""
        # Create projects directory in workspace
        workspace_dir = Path(os.getcwd()).parent / 'generated_projects'
        workspace_dir.mkdir(exist_ok=True)
        
        # Create project-specific directory
        project_dir = workspace_dir / f"project_{self.project.id}_{self.project.name.replace(' ', '_')}"
        project_dir.mkdir(exist_ok=True)
        
        return str(project_dir)
    
    def start_development(self) -> Dict:
        """
        Start the automated development process
        
        Workflow:
        1. Check OpenCode installation
        2. Get planning document
        3. Generate tasks from PRD
        4. Execute tasks in parallel
        5. Commit to GitHub
        
        Returns:
            Dictionary with development results
        """
        # Step 1: Check OpenCode
        if not self.executor.check_opencode_installed():
            return {
                'success': False,
                'error': 'OpenCode is not installed. Please install it first.',
                'install_command': 'brew install anomalyco/tap/opencode'
            }
        
        # Step 2: Get planning document
        try:
            planning_doc = PlanningDocument.objects.get(project=self.project)
        except PlanningDocument.DoesNotExist:
            return {
                'success': False,
                'error': 'Planning document not found. Generate it first.'
            }
        
        # Step 3: Get agents
        agents = Agent.objects.filter(project=self.project)
        if not agents.exists():
            return {
                'success': False,
                'error': 'No agents found. Generate planning document first.'
            }
        
        # Step 4: Generate tasks
        tasks = self._generate_tasks_from_prd(planning_doc, agents)
        
        # Step 5: Execute tasks
        results = self._execute_tasks(tasks)
        
        # Step 6: Commit to GitHub
        commit_result = self.executor.commit_to_github(
            f"Auto-generated code for {self.project.name}"
        )
        
        return {
            'success': True,
            'project_directory': self.project_dir,
            'tasks_executed': len(results),
            'tasks_successful': sum(1 for r in results if r.get('success')),
            'tasks_failed': sum(1 for r in results if not r.get('success')),
            'commit_result': commit_result,
            'results': results
        }
    
    def _generate_tasks_from_prd(
        self,
        planning_doc: PlanningDocument,
        agents: List[Agent]
    ) -> List[Dict]:
        """Generate executable tasks from PRD"""
        tasks = []
        
        # Parse PRD sections
        prd_content = planning_doc.full_document
        
        # Task 1: Setup project structure
        tasks.append({
            'id': 'setup',
            'title': 'Setup Project Structure',
            'prompt': self._create_setup_prompt(planning_doc),
            'agent_role': 'build',
            'agent': agents.filter(role='backend_developer').first()
        })
        
        # Task 2: Implement backend
        if agents.filter(role='backend_developer').exists():
            tasks.append({
                'id': 'backend',
                'title': 'Implement Backend API',
                'prompt': self._create_backend_prompt(planning_doc),
                'agent_role': 'build',
                'agent': agents.filter(role='backend_developer').first()
            })
        
        # Task 3: Implement frontend
        if agents.filter(role='frontend_developer').exists():
            tasks.append({
                'id': 'frontend',
                'title': 'Implement Frontend UI',
                'prompt': self._create_frontend_prompt(planning_doc),
                'agent_role': 'build',
                'agent': agents.filter(role='frontend_developer').first()
            })
        
        # Task 4: Add tests
        if agents.filter(role='qa_engineer').exists():
            tasks.append({
                'id': 'tests',
                'title': 'Add Tests',
                'prompt': self._create_test_prompt(planning_doc),
                'agent_role': 'build',
                'agent': agents.filter(role='qa_engineer').first()
            })
        
        return tasks
    
    def _create_setup_prompt(self, planning_doc: PlanningDocument) -> str:
        """Create prompt for project setup"""
        tech_stack = planning_doc.tech_stack
        
        prompt = f"""# Setup Project Structure

## Project: {self.project.name}
{self.project.description}

## Tech Stack
- Frontend: {', '.join(tech_stack.get('frontend', []))}
- Backend: {', '.join(tech_stack.get('backend', []))}
- Database: {tech_stack.get('database', 'N/A')}

## Tasks
1. Initialize project structure
2. Setup package.json / requirements.txt
3. Create basic configuration files
4. Setup .gitignore
5. Create README.md with setup instructions

## Requirements
{planning_doc.executive_summary}

Please create a well-organized project structure following best practices.
"""
        return prompt
    
    def _create_backend_prompt(self, planning_doc: PlanningDocument) -> str:
        """Create prompt for backend development"""
        prompt = f"""# Implement Backend API

## Project: {self.project.name}

## Technical Requirements
{planning_doc.technical_requirements}

## Features to Implement
{planning_doc.feature_specifications}

## Tasks
1. Create database models
2. Implement API endpoints
3. Add authentication if needed
4. Add validation and error handling
5. Write API documentation

Please implement a production-ready backend following best practices.
"""
        return prompt
    
    def _create_frontend_prompt(self, planning_doc: PlanningDocument) -> str:
        """Create prompt for frontend development"""
        prompt = f"""# Implement Frontend UI

## Project: {self.project.name}

## Features
{planning_doc.feature_specifications}

## Tech Stack
Frontend: {', '.join(planning_doc.tech_stack.get('frontend', []))}

## Tasks
1. Create component structure
2. Implement main pages
3. Add routing
4. Connect to backend API
5. Add styling and responsive design

Please create a modern, user-friendly interface.
"""
        return prompt
    
    def _create_test_prompt(self, planning_doc: PlanningDocument) -> str:
        """Create prompt for testing"""
        prompt = f"""# Add Tests

## Project: {self.project.name}

## Tasks
1. Write unit tests for backend
2. Write integration tests
3. Add frontend component tests
4. Create test documentation

Please ensure good test coverage and follow testing best practices.
"""
        return prompt
    
    def _execute_tasks(self, tasks: List[Dict]) -> List[Dict]:
        """Execute tasks using OpenCode"""
        results = []
        
        for task in tasks:
            print(f"🚀 Executing task: {task['title']}")
            
            # Execute with OpenCode
            result = self.executor.execute_task(
                prompt=task['prompt'],
                agent_role=task['agent_role']
            )
            
            # Save to database
            if task.get('agent'):
                self._save_task_result(task, result)
            
            results.append({
                'task_id': task['id'],
                'task_title': task['title'],
                **result
            })
            
            print(f"{'✅' if result['success'] else '❌'} Task {task['title']}: {'Success' if result['success'] else 'Failed'}")
        
        return results
    
    def _save_task_result(self, task_info: Dict, result: Dict):
        """Save task execution result to database"""
        # Create or update task
        task, created = Task.objects.get_or_create(
            project=self.project,
            title=task_info['title'],
            defaults={
                'description': task_info['prompt'][:500],
                'assigned_to': task_info.get('agent'),
                'status': 'completed' if result['success'] else 'failed',
                'priority': 'high'
            }
        )
        
        if not created:
            task.status = 'completed' if result['success'] else 'failed'
            task.save()
        
        # Save output
        if result['success']:
            output, _ = TaskOutput.objects.get_or_create(
                task=task,
                defaults={
                    'output_type': 'code',
                    'content': result.get('stdout', ''),
                    'metadata': result.get('output', {})
                }
            )
            
            # Save generated files
            files = self.executor.get_generated_files()
            for file_path in files:
                full_path = Path(self.project_dir) / file_path
                if full_path.exists():
                    OutputFile.objects.get_or_create(
                        task_output=output,
                        path=str(file_path),
                        defaults={
                            'name': full_path.name,
                            'content': full_path.read_text(errors='ignore')[:10000],  # Limit size
                            'language': self._detect_language(file_path)
                        }
                    )
    
    def _detect_language(self, file_path: str) -> str:
        """Detect programming language from file extension"""
        ext_map = {
            '.py': 'python',
            '.js': 'javascript',
            '.ts': 'typescript',
            '.jsx': 'javascript',
            '.tsx': 'typescript',
            '.html': 'html',
            '.css': 'css',
            '.json': 'json',
            '.md': 'markdown',
        }
        ext = Path(file_path).suffix.lower()
        return ext_map.get(ext, 'text')


def start_project_development(project_id: int) -> Dict:
    """
    Main entry point to start project development
    
    Args:
        project_id: Project ID
    
    Returns:
        Dictionary with development results
    """
    try:
        project = Project.objects.get(id=project_id)
        orchestrator = ProjectOrchestrator(project)
        return orchestrator.start_development()
    
    except Project.DoesNotExist:
        return {
            'success': False,
            'error': 'Project not found'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

# Made with Bob
