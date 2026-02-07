"""
OpenCode Executor
Executes OpenCode CLI commands to generate code
"""
import subprocess
import json
import os
from typing import Dict, List, Optional
from pathlib import Path


class OpenCodeExecutor:
    """Execute OpenCode CLI commands"""
    
    def __init__(self, project_path: str):
        """
        Initialize OpenCode executor
        
        Args:
            project_path: Path to the project directory where code will be generated
        """
        self.project_path = Path(project_path)
        self.project_path.mkdir(parents=True, exist_ok=True)
    
    def check_opencode_installed(self) -> bool:
        """Check if OpenCode CLI is installed"""
        try:
            result = subprocess.run(
                ['opencode', '--version'],
                capture_output=True,
                text=True,
                timeout=5
            )
            return result.returncode == 0
        except (subprocess.TimeoutExpired, FileNotFoundError):
            return False
    
    def execute_task(
        self,
        prompt: str,
        agent_role: str = 'build',
        timeout: int = 300
    ) -> Dict:
        """
        Execute a task using OpenCode
        
        Args:
            prompt: The task prompt/instruction
            agent_role: OpenCode agent to use ('build', 'plan', 'general')
            timeout: Timeout in seconds
        
        Returns:
            Dictionary with execution results
        """
        if not self.check_opencode_installed():
            return {
                'success': False,
                'error': 'OpenCode CLI is not installed. Install with: brew install anomalyco/tap/opencode'
            }
        
        try:
            # Create a temporary prompt file
            prompt_file = self.project_path / '.opencode_prompt.txt'
            prompt_file.write_text(prompt)
            
            # Execute OpenCode in the project directory
            cmd = [
                'opencode',
                '--agent', agent_role,
                '--prompt', str(prompt_file),
                '--non-interactive',
                '--json-output'
            ]
            
            result = subprocess.run(
                cmd,
                cwd=str(self.project_path),
                capture_output=True,
                text=True,
                timeout=timeout
            )
            
            # Clean up prompt file
            prompt_file.unlink(missing_ok=True)
            
            if result.returncode == 0:
                # Parse JSON output if available
                try:
                    output_data = json.loads(result.stdout)
                except json.JSONDecodeError:
                    output_data = {'raw_output': result.stdout}
                
                return {
                    'success': True,
                    'output': output_data,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            else:
                return {
                    'success': False,
                    'error': f'OpenCode execution failed with code {result.returncode}',
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
        
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': f'OpenCode execution timed out after {timeout} seconds'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }
    
    def execute_parallel_tasks(
        self,
        tasks: List[Dict],
        max_workers: int = 3
    ) -> List[Dict]:
        """
        Execute multiple tasks in parallel
        
        Args:
            tasks: List of task dictionaries with 'prompt' and 'agent_role'
            max_workers: Maximum number of parallel workers
        
        Returns:
            List of execution results
        """
        from concurrent.futures import ThreadPoolExecutor, as_completed
        
        results = []
        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            future_to_task = {
                executor.submit(
                    self.execute_task,
                    task['prompt'],
                    task.get('agent_role', 'build')
                ): task
                for task in tasks
            }
            
            for future in as_completed(future_to_task):
                task = future_to_task[future]
                try:
                    result = future.result()
                    result['task_id'] = task.get('id')
                    result['task_title'] = task.get('title')
                    results.append(result)
                except Exception as e:
                    results.append({
                        'success': False,
                        'error': str(e),
                        'task_id': task.get('id'),
                        'task_title': task.get('title')
                    })
        
        return results
    
    def get_generated_files(self) -> List[str]:
        """Get list of files generated in the project directory"""
        files = []
        for file_path in self.project_path.rglob('*'):
            if file_path.is_file() and not file_path.name.startswith('.'):
                relative_path = file_path.relative_to(self.project_path)
                files.append(str(relative_path))
        return files
    
    def commit_to_github(self, commit_message: str) -> Dict:
        """
        Commit generated code to GitHub
        
        Args:
            commit_message: Git commit message
        
        Returns:
            Dictionary with commit results
        """
        try:
            # Check if git is initialized
            git_dir = self.project_path / '.git'
            if not git_dir.exists():
                # Initialize git repository
                subprocess.run(
                    ['git', 'init'],
                    cwd=str(self.project_path),
                    check=True
                )
            
            # Add all files
            subprocess.run(
                ['git', 'add', '.'],
                cwd=str(self.project_path),
                check=True
            )
            
            # Commit
            result = subprocess.run(
                ['git', 'commit', '-m', commit_message],
                cwd=str(self.project_path),
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                return {
                    'success': True,
                    'message': 'Successfully committed to git',
                    'output': result.stdout
                }
            else:
                return {
                    'success': False,
                    'error': 'Git commit failed',
                    'output': result.stderr
                }
        
        except subprocess.CalledProcessError as e:
            return {
                'success': False,
                'error': f'Git command failed: {str(e)}'
            }
        except Exception as e:
            return {
                'success': False,
                'error': f'Unexpected error: {str(e)}'
            }


def create_task_prompt(task_title: str, task_description: str, context: Dict) -> str:
    """
    Create a detailed prompt for OpenCode based on task information
    
    Args:
        task_title: Title of the task
        task_description: Description of the task
        context: Additional context (PRD, tech stack, etc.)
    
    Returns:
        Formatted prompt string
    """
    prompt = f"""# Task: {task_title}

## Description
{task_description}

## Project Context
- Project: {context.get('project_name', 'N/A')}
- Tech Stack: {context.get('tech_stack', 'N/A')}
- Requirements: {context.get('requirements', 'N/A')}

## Instructions
{context.get('instructions', 'Complete the task according to best practices.')}

## Expected Output
- Follow the project's coding standards
- Write clean, maintainable code
- Include comments where necessary
- Ensure code is production-ready

## Additional Notes
{context.get('notes', 'N/A')}
"""
    return prompt

# Made with Bob
