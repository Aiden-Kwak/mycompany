"""
GitHub API Client for repository management and OAuth integration
"""
from github import Github as GithubAPI, GithubException
from cryptography.fernet import Fernet
from django.conf import settings
import os


class GitHubClient:
    """GitHub API client for managing repositories and commits"""
    
    def __init__(self, access_token=None):
        """
        Initialize GitHub client with access token
        
        Args:
            access_token: GitHub personal access token or OAuth token
        """
        self.access_token = access_token
        self.client = Github(access_token) if access_token else None
        
    def get_user(self):
        """Get authenticated user information"""
        if not self.client:
            raise ValueError("GitHub client not authenticated")
        return self.client.get_user()
    
    def create_repository(self, name, description="", private=True, auto_init=True):
        """
        Create a new GitHub repository
        
        Args:
            name: Repository name
            description: Repository description
            private: Whether the repository should be private
            auto_init: Initialize with README
            
        Returns:
            Repository object
        """
        try:
            user = self.get_user()
            repo = user.create_repo(
                name=name,
                description=description,
                private=private,
                auto_init=auto_init
            )
            return {
                'id': repo.id,
                'name': repo.name,
                'full_name': repo.full_name,
                'html_url': repo.html_url,
                'clone_url': repo.clone_url,
                'default_branch': repo.default_branch,
                'private': repo.private
            }
        except GithubException as e:
            raise Exception(f"Failed to create repository: {e.data.get('message', str(e))}")
    
    def get_repository(self, repo_name):
        """
        Get repository by name
        
        Args:
            repo_name: Repository name (format: "owner/repo")
            
        Returns:
            Repository object
        """
        try:
            return self.client.get_repo(repo_name)
        except GithubException as e:
            raise Exception(f"Failed to get repository: {e.data.get('message', str(e))}")
    
    def create_file(self, repo_name, file_path, content, commit_message, branch="main"):
        """
        Create a new file in repository
        
        Args:
            repo_name: Repository name (format: "owner/repo")
            file_path: Path to file in repository
            content: File content
            commit_message: Commit message
            branch: Branch name
            
        Returns:
            Commit information
        """
        try:
            repo = self.get_repository(repo_name)
            result = repo.create_file(
                path=file_path,
                message=commit_message,
                content=content,
                branch=branch
            )
            return {
                'commit': result['commit'].sha,
                'content': result['content'].path
            }
        except GithubException as e:
            raise Exception(f"Failed to create file: {e.data.get('message', str(e))}")
    
    def update_file(self, repo_name, file_path, content, commit_message, branch="main"):
        """
        Update an existing file in repository
        
        Args:
            repo_name: Repository name (format: "owner/repo")
            file_path: Path to file in repository
            content: New file content
            commit_message: Commit message
            branch: Branch name
            
        Returns:
            Commit information
        """
        try:
            repo = self.get_repository(repo_name)
            file = repo.get_contents(file_path, ref=branch)
            result = repo.update_file(
                path=file_path,
                message=commit_message,
                content=content,
                sha=file.sha,
                branch=branch
            )
            return {
                'commit': result['commit'].sha,
                'content': result['content'].path
            }
        except GithubException as e:
            raise Exception(f"Failed to update file: {e.data.get('message', str(e))}")
    
    def create_or_update_file(self, repo_name, file_path, content, commit_message, branch="main"):
        """
        Create or update a file (checks if exists first)
        
        Args:
            repo_name: Repository name (format: "owner/repo")
            file_path: Path to file in repository
            content: File content
            commit_message: Commit message
            branch: Branch name
            
        Returns:
            Commit information
        """
        try:
            repo = self.get_repository(repo_name)
            try:
                # Try to get the file (will raise exception if doesn't exist)
                repo.get_contents(file_path, ref=branch)
                return self.update_file(repo_name, file_path, content, commit_message, branch)
            except GithubException:
                # File doesn't exist, create it
                return self.create_file(repo_name, file_path, content, commit_message, branch)
        except Exception as e:
            raise Exception(f"Failed to create/update file: {str(e)}")
    
    def create_branch(self, repo_name, branch_name, from_branch="main"):
        """
        Create a new branch
        
        Args:
            repo_name: Repository name (format: "owner/repo")
            branch_name: New branch name
            from_branch: Source branch to branch from
            
        Returns:
            Branch reference
        """
        try:
            repo = self.get_repository(repo_name)
            source = repo.get_branch(from_branch)
            repo.create_git_ref(
                ref=f"refs/heads/{branch_name}",
                sha=source.commit.sha
            )
            return {'branch': branch_name, 'sha': source.commit.sha}
        except GithubException as e:
            raise Exception(f"Failed to create branch: {e.data.get('message', str(e))}")
    
    def create_pull_request(self, repo_name, title, body, head_branch, base_branch="main"):
        """
        Create a pull request
        
        Args:
            repo_name: Repository name (format: "owner/repo")
            title: PR title
            body: PR description
            head_branch: Source branch
            base_branch: Target branch
            
        Returns:
            Pull request information
        """
        try:
            repo = self.get_repository(repo_name)
            pr = repo.create_pull(
                title=title,
                body=body,
                head=head_branch,
                base=base_branch
            )
            return {
                'number': pr.number,
                'html_url': pr.html_url,
                'state': pr.state
            }
        except GithubException as e:
            raise Exception(f"Failed to create pull request: {e.data.get('message', str(e))}")
    
    def list_repositories(self):
        """
        List all repositories for authenticated user
        
        Returns:
            List of repository information
        """
        try:
            user = self.get_user()
            repos = user.get_repos()
            return [{
                'id': repo.id,
                'name': repo.name,
                'full_name': repo.full_name,
                'html_url': repo.html_url,
                'private': repo.private,
                'description': repo.description
            } for repo in repos]
        except GithubException as e:
            raise Exception(f"Failed to list repositories: {e.data.get('message', str(e))}")
    
    def get_rate_limit(self):
        """
        Get current API rate limit status
        
        Returns:
            Rate limit information
        """
        if not self.client:
            raise ValueError("GitHub client not authenticated")
        
        rate_limit = self.client.get_rate_limit()
        return {
            'core': {
                'limit': rate_limit.core.limit,
                'remaining': rate_limit.core.remaining,
                'reset': rate_limit.core.reset.isoformat()
            }
        }


class TokenEncryption:
    """Utility class for encrypting/decrypting GitHub tokens"""
    
    @staticmethod
    def get_encryption_key():
        """Get or generate encryption key"""
        key = os.environ.get('GITHUB_TOKEN_ENCRYPTION_KEY')
        if not key:
            # Generate a new key if not exists
            key = Fernet.generate_key().decode()
            print(f"Generated new encryption key. Add to .env: GITHUB_TOKEN_ENCRYPTION_KEY={key}")
        return key.encode() if isinstance(key, str) else key
    
    @staticmethod
    def encrypt_token(token):
        """Encrypt GitHub access token"""
        key = TokenEncryption.get_encryption_key()
        f = Fernet(key)
        return f.encrypt(token.encode()).decode()
    
    @staticmethod
    def decrypt_token(encrypted_token):
        """Decrypt GitHub access token"""
        key = TokenEncryption.get_encryption_key()
        f = Fernet(key)
        return f.decrypt(encrypted_token.encode()).decode()


# Made with Bob