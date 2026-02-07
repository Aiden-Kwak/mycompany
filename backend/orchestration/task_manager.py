"""
Task Manager for orchestrating task execution with dependency management.
Inspired by OpenCode's orchestration logic.
"""
import asyncio
import logging
from typing import List, Dict, Set, Optional, Any
from datetime import datetime
from collections import defaultdict, deque

logger = logging.getLogger(__name__)


class TaskNode:
    """Represents a task in the dependency graph."""
    
    def __init__(self, task_id: str, task_data: Dict[str, Any]):
        self.id = task_id
        self.data = task_data
        self.status = 'pending'  # pending, in_progress, completed, failed
        self.dependencies: Set[str] = set(task_data.get('dependencies', []))
        self.result: Optional[Any] = None
        self.error: Optional[str] = None
        self.started_at: Optional[datetime] = None
        self.completed_at: Optional[datetime] = None
        self.retry_count = 0
    
    def can_execute(self, completed_tasks: Set[str]) -> bool:
        """Check if all dependencies are completed."""
        return self.dependencies.issubset(completed_tasks)
    
    def mark_started(self):
        """Mark task as started."""
        self.status = 'in_progress'
        self.started_at = datetime.now()
    
    def mark_completed(self, result: Any):
        """Mark task as completed."""
        self.status = 'completed'
        self.result = result
        self.completed_at = datetime.now()
    
    def mark_failed(self, error: str):
        """Mark task as failed."""
        self.status = 'failed'
        self.error = error
        self.completed_at = datetime.now()


class TaskManager:
    """
    Manages task execution with dependency resolution and parallel execution.
    
    Features:
    - Dependency graph construction
    - Topological sorting
    - Parallel execution of independent tasks
    - Retry logic with exponential backoff
    - Rollback on failure
    """
    
    def __init__(self, max_retries: int = 3, max_parallel: int = 4):
        self.max_retries = max_retries
        self.max_parallel = max_parallel
        self.tasks: Dict[str, TaskNode] = {}
        self.completed_tasks: Set[str] = set()
        self.failed_tasks: Set[str] = set()
        self.execution_log: List[Dict[str, Any]] = []
    
    def add_task(self, task_id: str, task_data: Dict[str, Any]):
        """Add a task to the manager."""
        self.tasks[task_id] = TaskNode(task_id, task_data)
        logger.info(f"Added task: {task_id}")
    
    def add_tasks(self, tasks: List[Dict[str, Any]]):
        """Add multiple tasks."""
        for task in tasks:
            task_id = task.get('id') or task.get('title', f"task_{len(self.tasks)}")
            self.add_task(task_id, task)
    
    def build_dependency_graph(self) -> Dict[str, Set[str]]:
        """Build dependency graph (adjacency list)."""
        graph = defaultdict(set)
        for task_id, node in self.tasks.items():
            for dep in node.dependencies:
                graph[dep].add(task_id)
        return dict(graph)
    
    def topological_sort(self) -> List[List[str]]:
        """
        Perform topological sort to get execution order.
        Returns list of batches where tasks in each batch can run in parallel.
        """
        # Calculate in-degree for each task
        in_degree = {task_id: len(node.dependencies) 
                    for task_id, node in self.tasks.items()}
        
        # Find tasks with no dependencies
        queue = deque([task_id for task_id, degree in in_degree.items() 
                      if degree == 0])
        
        batches = []
        graph = self.build_dependency_graph()
        
        while queue:
            # Current batch: all tasks with no remaining dependencies
            batch = list(queue)
            batches.append(batch)
            queue.clear()
            
            # Process current batch
            for task_id in batch:
                # Reduce in-degree for dependent tasks
                for dependent in graph.get(task_id, []):
                    in_degree[dependent] -= 1
                    if in_degree[dependent] == 0:
                        queue.append(dependent)
        
        # Check for cycles
        if sum(in_degree.values()) > 0:
            remaining = [tid for tid, deg in in_degree.items() if deg > 0]
            raise ValueError(f"Circular dependency detected: {remaining}")
        
        return batches
    
    def get_executable_tasks(self) -> List[TaskNode]:
        """Get tasks that can be executed now."""
        executable = []
        for task_id, node in self.tasks.items():
            if (node.status == 'pending' and 
                node.can_execute(self.completed_tasks)):
                executable.append(node)
        return executable
    
    async def execute_task(self, node: TaskNode, executor_func) -> Any:
        """
        Execute a single task with retry logic.
        
        Args:
            node: TaskNode to execute
            executor_func: Async function that executes the task
        """
        node.mark_started()
        self.log_event('task_started', node.id)
        
        for attempt in range(self.max_retries):
            try:
                # Execute the task
                result = await executor_func(node.data)
                
                # Mark as completed
                node.mark_completed(result)
                self.completed_tasks.add(node.id)
                self.log_event('task_completed', node.id, {'result': result})
                
                return result
                
            except Exception as e:
                error_msg = str(e)
                logger.error(f"Task {node.id} failed (attempt {attempt + 1}): {error_msg}")
                
                if attempt < self.max_retries - 1:
                    # Exponential backoff
                    wait_time = 2 ** attempt
                    self.log_event('task_retry', node.id, {
                        'attempt': attempt + 1,
                        'error': error_msg,
                        'wait_time': wait_time
                    })
                    await asyncio.sleep(wait_time)
                else:
                    # Final failure
                    node.mark_failed(error_msg)
                    self.failed_tasks.add(node.id)
                    self.log_event('task_failed', node.id, {'error': error_msg})
                    raise
    
    async def execute_batch(self, batch: List[TaskNode], executor_func) -> List[Any]:
        """Execute a batch of tasks in parallel."""
        self.log_event('batch_started', None, {'task_count': len(batch)})
        
        # Limit parallelism
        semaphore = asyncio.Semaphore(self.max_parallel)
        
        async def execute_with_semaphore(node):
            async with semaphore:
                return await self.execute_task(node, executor_func)
        
        # Execute all tasks in batch
        results = await asyncio.gather(
            *[execute_with_semaphore(node) for node in batch],
            return_exceptions=True
        )
        
        self.log_event('batch_completed', None, {
            'task_count': len(batch),
            'success_count': sum(1 for r in results if not isinstance(r, Exception))
        })
        
        return results
    
    async def execute_all(self, executor_func) -> Dict[str, Any]:
        """
        Execute all tasks respecting dependencies.
        
        Args:
            executor_func: Async function that takes task_data and returns result
        
        Returns:
            Dict with execution summary
        """
        start_time = datetime.now()
        self.log_event('execution_started', None, {'task_count': len(self.tasks)})
        
        try:
            # Get execution order
            batches = self.topological_sort()
            self.log_event('execution_plan', None, {
                'batch_count': len(batches),
                'batches': [[node.id for node in batch] for batch in 
                           [[self.tasks[tid] for tid in b] for b in batches]]
            })
            
            # Execute each batch
            for i, batch_ids in enumerate(batches):
                batch_nodes = [self.tasks[tid] for tid in batch_ids]
                self.log_event('batch_executing', None, {
                    'batch_number': i + 1,
                    'total_batches': len(batches),
                    'tasks': batch_ids
                })
                
                await self.execute_batch(batch_nodes, executor_func)
            
            # Execution summary
            end_time = datetime.now()
            duration = (end_time - start_time).total_seconds()
            
            summary = {
                'status': 'completed' if not self.failed_tasks else 'partial_failure',
                'total_tasks': len(self.tasks),
                'completed_tasks': len(self.completed_tasks),
                'failed_tasks': len(self.failed_tasks),
                'duration_seconds': duration,
                'started_at': start_time.isoformat(),
                'completed_at': end_time.isoformat(),
                'failed_task_ids': list(self.failed_tasks)
            }
            
            self.log_event('execution_completed', None, summary)
            return summary
            
        except Exception as e:
            self.log_event('execution_failed', None, {'error': str(e)})
            raise
    
    def rollback(self, rollback_func):
        """
        Rollback completed tasks in reverse order.
        
        Args:
            rollback_func: Function that takes task_id and performs rollback
        """
        self.log_event('rollback_started', None, {
            'task_count': len(self.completed_tasks)
        })
        
        # Rollback in reverse completion order
        for task_id in reversed(list(self.completed_tasks)):
            try:
                rollback_func(task_id)
                self.log_event('task_rolled_back', task_id)
            except Exception as e:
                logger.error(f"Failed to rollback task {task_id}: {e}")
                self.log_event('rollback_failed', task_id, {'error': str(e)})
        
        self.log_event('rollback_completed', None)
    
    def log_event(self, event_type: str, task_id: Optional[str], 
                  data: Optional[Dict[str, Any]] = None):
        """Log an execution event."""
        event = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'task_id': task_id,
            'data': data or {}
        }
        self.execution_log.append(event)
        logger.info(f"Event: {event_type} - Task: {task_id}")
    
    def get_status(self) -> Dict[str, Any]:
        """Get current execution status."""
        return {
            'total_tasks': len(self.tasks),
            'pending_tasks': len([t for t in self.tasks.values() 
                                 if t.status == 'pending']),
            'in_progress_tasks': len([t for t in self.tasks.values() 
                                     if t.status == 'in_progress']),
            'completed_tasks': len(self.completed_tasks),
            'failed_tasks': len(self.failed_tasks),
            'tasks': {
                task_id: {
                    'status': node.status,
                    'started_at': node.started_at.isoformat() if node.started_at else None,
                    'completed_at': node.completed_at.isoformat() if node.completed_at else None,
                    'error': node.error,
                    'retry_count': node.retry_count
                }
                for task_id, node in self.tasks.items()
            }
        }
    
    def get_execution_log(self) -> List[Dict[str, Any]]:
        """Get execution log."""
        return self.execution_log


# Example usage
async def example_task_executor(task_data: Dict[str, Any]) -> str:
    """Example task executor function."""
    task_id = task_data.get('id', 'unknown')
    await asyncio.sleep(1)  # Simulate work
    return f"Completed {task_id}"


async def main():
    """Example usage of TaskManager."""
    manager = TaskManager(max_retries=3, max_parallel=2)
    
    # Add tasks with dependencies
    tasks = [
        {'id': 'setup', 'title': 'Setup project', 'dependencies': []},
        {'id': 'backend', 'title': 'Build backend', 'dependencies': ['setup']},
        {'id': 'frontend', 'title': 'Build frontend', 'dependencies': ['setup']},
        {'id': 'tests', 'title': 'Run tests', 'dependencies': ['backend', 'frontend']},
    ]
    
    manager.add_tasks(tasks)
    
    # Execute all tasks
    summary = await manager.execute_all(example_task_executor)
    print(f"Execution summary: {summary}")
    
    # Get status
    status = manager.get_status()
    print(f"Final status: {status}")


if __name__ == '__main__':
    asyncio.run(main())

# Made with Bob
