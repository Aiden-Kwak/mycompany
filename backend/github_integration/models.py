"""
GitHub integration models
"""
from django.db import models
from django.contrib.auth.models import User
from projects.models import Project
from .client import TokenEncryption


class GitHubAccount(models.Model):
    """Store GitHub account information for users"""
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='github_account')
    github_id = models.BigIntegerField(unique=True)
    username = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)  # Allow null
    avatar_url = models.URLField(blank=True)
    access_token_encrypted = models.TextField()  # Encrypted token
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'github_accounts'
    
    def __str__(self):
        return f"{self.username} (GitHub)"
    
    def set_access_token(self, token):
        """Encrypt and store access token"""
        self.access_token_encrypted = TokenEncryption.encrypt_token(token)
    
    def get_access_token(self):
        """Decrypt and return access token"""
        return TokenEncryption.decrypt_token(self.access_token_encrypted)


class GitHubRepository(models.Model):
    """Store GitHub repository information linked to projects"""
    
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='github_repository')
    github_account = models.ForeignKey(GitHubAccount, on_delete=models.CASCADE, related_name='repositories')
    repo_id = models.BigIntegerField()
    name = models.CharField(max_length=255)
    full_name = models.CharField(max_length=255)  # owner/repo
    html_url = models.URLField()
    clone_url = models.URLField()
    default_branch = models.CharField(max_length=100, default='main')
    is_private = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'github_repositories'
        unique_together = ['github_account', 'repo_id']
    
    def __str__(self):
        return self.full_name


class GitHubCommit(models.Model):
    """Track commits made to GitHub repositories"""
    
    repository = models.ForeignKey(GitHubRepository, on_delete=models.CASCADE, related_name='commits')
    sha = models.CharField(max_length=40)
    message = models.TextField()
    author = models.CharField(max_length=255)
    branch = models.CharField(max_length=100, default='main')
    file_path = models.CharField(max_length=500, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'github_commits'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.sha[:7]} - {self.message[:50]}"


# Made with Bob