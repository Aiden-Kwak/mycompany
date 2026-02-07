"""
File Manager for codebase manipulation operations.
Inspired by OpenCode's file management logic.
"""
import os
import difflib
import logging
import shutil
from pathlib import Path
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
import json

logger = logging.getLogger(__name__)


class FileChange:
    """Represents a file change operation."""
    
    def __init__(self, action: str, path: str, content: Optional[str] = None, 
                 original: Optional[str] = None):
        self.action = action  # create, modify, delete
        self.path = path
        self.content = content
        self.original = original
        self.timestamp = datetime.now()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            'action': self.action,
            'path': self.path,
            'content_length': len(self.content) if self.content else 0,
            'timestamp': self.timestamp.isoformat()
        }


class FileManager:
    """
    Manages file operations for code generation.
    
    Features:
    - File creation/modification/deletion
    - Diff generation and application
    - Change tracking and rollback
    - Backup management
    """
    
    def __init__(self, project_path: str, enable_backup: bool = True):
        self.project_path = Path(project_path)
        self.enable_backup = enable_backup
        self.backup_path = self.project_path / '.backups'
        self.changes_log: List[FileChange] = []
        
        # Create project directory if it doesn't exist
        self.project_path.mkdir(parents=True, exist_ok=True)
        
        if self.enable_backup:
            self.backup_path.mkdir(parents=True, exist_ok=True)
        
        logger.info(f"FileManager initialized for: {self.project_path}")
    
    def create_file(self, relative_path: str, content: str, 
                   overwrite: bool = False) -> Path:
        """
        Create a new file.
        
        Args:
            relative_path: Path relative to project root
            content: File content
            overwrite: Whether to overwrite if file exists
        
        Returns:
            Path to created file
        """
        file_path = self.project_path / relative_path
        
        # Check if file exists
        if file_path.exists() and not overwrite:
            raise FileExistsError(f"File already exists: {relative_path}")
        
        # Create parent directories
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Backup if exists
        if file_path.exists() and self.enable_backup:
            self._backup_file(file_path)
        
        # Write file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        # Track change
        change = FileChange('create', relative_path, content)
        self.changes_log.append(change)
        
        logger.info(f"Created file: {relative_path} ({len(content)} bytes)")
        return file_path
    
    def modify_file(self, relative_path: str, new_content: str) -> Path:
        """
        Modify an existing file.
        
        Args:
            relative_path: Path relative to project root
            new_content: New file content
        
        Returns:
            Path to modified file
        """
        file_path = self.project_path / relative_path
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        
        # Read original content
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Backup original
        if self.enable_backup:
            self._backup_file(file_path)
        
        # Write new content
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        # Track change
        change = FileChange('modify', relative_path, new_content, original_content)
        self.changes_log.append(change)
        
        logger.info(f"Modified file: {relative_path}")
        return file_path
    
    def delete_file(self, relative_path: str) -> None:
        """
        Delete a file.
        
        Args:
            relative_path: Path relative to project root
        """
        file_path = self.project_path / relative_path
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        
        # Read content for backup
        with open(file_path, 'r', encoding='utf-8') as f:
            original_content = f.read()
        
        # Backup before deletion
        if self.enable_backup:
            self._backup_file(file_path)
        
        # Delete file
        file_path.unlink()
        
        # Track change
        change = FileChange('delete', relative_path, None, original_content)
        self.changes_log.append(change)
        
        logger.info(f"Deleted file: {relative_path}")
    
    def read_file(self, relative_path: str) -> str:
        """
        Read file content.
        
        Args:
            relative_path: Path relative to project root
        
        Returns:
            File content
        """
        file_path = self.project_path / relative_path
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def file_exists(self, relative_path: str) -> bool:
        """Check if file exists."""
        return (self.project_path / relative_path).exists()
    
    def generate_diff(self, original: str, modified: str, 
                     filename: str = 'file') -> str:
        """
        Generate unified diff between two versions.
        
        Args:
            original: Original content
            modified: Modified content
            filename: Filename for diff header
        
        Returns:
            Unified diff string
        """
        original_lines = original.splitlines(keepends=True)
        modified_lines = modified.splitlines(keepends=True)
        
        diff = difflib.unified_diff(
            original_lines,
            modified_lines,
            fromfile=f'a/{filename}',
            tofile=f'b/{filename}',
            lineterm=''
        )
        
        return ''.join(diff)
    
    def apply_diff(self, relative_path: str, diff_text: str) -> Path:
        """
        Apply a unified diff to a file.
        
        Args:
            relative_path: Path relative to project root
            diff_text: Unified diff text
        
        Returns:
            Path to modified file
        """
        file_path = self.project_path / relative_path
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        
        # Read original
        with open(file_path, 'r', encoding='utf-8') as f:
            original_lines = f.readlines()
        
        # Parse and apply diff
        modified_lines = self._apply_unified_diff(original_lines, diff_text)
        
        # Write modified content
        modified_content = ''.join(modified_lines)
        return self.modify_file(relative_path, modified_content)
    
    def _apply_unified_diff(self, original_lines: List[str], 
                           diff_text: str) -> List[str]:
        """
        Apply unified diff to lines.
        
        This is a simplified implementation. For production, consider using
        the `patch` library or subprocess call to `patch` command.
        """
        # Parse diff
        diff_lines = diff_text.splitlines()
        
        # Simple line-by-line application
        # This is a basic implementation - real diff application is more complex
        result = original_lines.copy()
        
        # TODO: Implement proper diff parsing and application
        # For now, this is a placeholder
        logger.warning("Diff application is simplified - consider using patch library")
        
        return result
    
    def create_directory(self, relative_path: str) -> Path:
        """
        Create a directory.
        
        Args:
            relative_path: Path relative to project root
        
        Returns:
            Path to created directory
        """
        dir_path = self.project_path / relative_path
        dir_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"Created directory: {relative_path}")
        return dir_path
    
    def list_files(self, relative_path: str = '', 
                  pattern: str = '*') -> List[str]:
        """
        List files in a directory.
        
        Args:
            relative_path: Directory path relative to project root
            pattern: Glob pattern for filtering
        
        Returns:
            List of file paths relative to project root
        """
        dir_path = self.project_path / relative_path
        
        if not dir_path.exists():
            return []
        
        files = []
        for file_path in dir_path.rglob(pattern):
            if file_path.is_file():
                rel_path = file_path.relative_to(self.project_path)
                files.append(str(rel_path))
        
        return sorted(files)
    
    def get_file_info(self, relative_path: str) -> Dict[str, Any]:
        """
        Get file information.
        
        Args:
            relative_path: Path relative to project root
        
        Returns:
            Dictionary with file info
        """
        file_path = self.project_path / relative_path
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {relative_path}")
        
        stat = file_path.stat()
        
        return {
            'path': relative_path,
            'size': stat.st_size,
            'created': datetime.fromtimestamp(stat.st_ctime).isoformat(),
            'modified': datetime.fromtimestamp(stat.st_mtime).isoformat(),
            'is_file': file_path.is_file(),
            'is_dir': file_path.is_dir()
        }
    
    def _backup_file(self, file_path: Path) -> Path:
        """
        Create a backup of a file.
        
        Args:
            file_path: Path to file to backup
        
        Returns:
            Path to backup file
        """
        if not file_path.exists():
            raise FileNotFoundError(f"File not found for backup: {file_path}")
        
        # Generate backup filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        rel_path = file_path.relative_to(self.project_path)
        backup_file = self.backup_path / f"{rel_path}_{timestamp}"
        
        # Create backup directory
        backup_file.parent.mkdir(parents=True, exist_ok=True)
        
        # Copy file
        shutil.copy2(file_path, backup_file)
        
        logger.debug(f"Backed up: {rel_path} -> {backup_file.name}")
        return backup_file
    
    def rollback(self, steps: int = 1) -> None:
        """
        Rollback recent changes.
        
        Args:
            steps: Number of changes to rollback
        """
        if not self.changes_log:
            logger.warning("No changes to rollback")
            return
        
        logger.info(f"Rolling back {steps} changes")
        
        for _ in range(min(steps, len(self.changes_log))):
            change = self.changes_log.pop()
            
            try:
                if change.action == 'create':
                    # Delete created file
                    file_path = self.project_path / change.path
                    if file_path.exists():
                        file_path.unlink()
                        logger.info(f"Rolled back create: {change.path}")
                
                elif change.action == 'modify':
                    # Restore original content
                    if change.original:
                        file_path = self.project_path / change.path
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(change.original)
                        logger.info(f"Rolled back modify: {change.path}")
                
                elif change.action == 'delete':
                    # Restore deleted file
                    if change.original:
                        file_path = self.project_path / change.path
                        file_path.parent.mkdir(parents=True, exist_ok=True)
                        with open(file_path, 'w', encoding='utf-8') as f:
                            f.write(change.original)
                        logger.info(f"Rolled back delete: {change.path}")
            
            except Exception as e:
                logger.error(f"Failed to rollback {change.path}: {e}")
    
    def get_changes_log(self) -> List[Dict[str, Any]]:
        """Get list of all changes."""
        return [change.to_dict() for change in self.changes_log]
    
    def save_changes_log(self, filename: str = 'changes.json') -> Path:
        """
        Save changes log to file.
        
        Args:
            filename: Name of log file
        
        Returns:
            Path to log file
        """
        log_path = self.project_path / filename
        
        with open(log_path, 'w', encoding='utf-8') as f:
            json.dump(self.get_changes_log(), f, indent=2)
        
        logger.info(f"Saved changes log to: {filename}")
        return log_path
    
    def get_stats(self) -> Dict[str, Any]:
        """Get file manager statistics."""
        return {
            'project_path': str(self.project_path),
            'total_changes': len(self.changes_log),
            'creates': sum(1 for c in self.changes_log if c.action == 'create'),
            'modifies': sum(1 for c in self.changes_log if c.action == 'modify'),
            'deletes': sum(1 for c in self.changes_log if c.action == 'delete'),
            'backup_enabled': self.enable_backup,
            'total_files': len(self.list_files())
        }


# Example usage
def main():
    """Example usage of FileManager."""
    # Create file manager
    fm = FileManager('/tmp/test_project')
    
    # Create files
    fm.create_file('README.md', '# Test Project\n\nThis is a test.')
    fm.create_file('src/main.py', 'def main():\n    print("Hello")\n')
    
    # Modify file
    fm.modify_file('README.md', '# Test Project\n\nUpdated content.')
    
    # List files
    files = fm.list_files()
    print(f"Files: {files}")
    
    # Get stats
    stats = fm.get_stats()
    print(f"Stats: {stats}")
    
    # Rollback
    fm.rollback(1)
    
    # Save log
    fm.save_changes_log()


if __name__ == '__main__':
    main()

# Made with Bob
