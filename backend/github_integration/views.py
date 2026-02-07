from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

from .models import GitHubAccount, GitHubRepository, GitHubCommit
from .serializers import (
    GitHubAccountSerializer,
    GitHubRepositorySerializer,
    GitHubCommitSerializer,
    RepositoryCreateSerializer,
    CommitFileSerializer
)
from .client import GitHubClient
from projects.models import Project


class GitHubAccountViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for GitHub accounts"""
    serializer_class = GitHubAccountSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return GitHubAccount.objects.filter(user=self.request.user)


class GitHubRepositoryViewSet(viewsets.ModelViewSet):
    """ViewSet for GitHub repositories"""
    serializer_class = GitHubRepositorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return GitHubRepository.objects.filter(github_account__user=user)
    
    @action(detail=False, methods=['post'], url_path='create-repository')
    def create_repository(self, request):
        """Create a new GitHub repository for a project"""
        serializer = RepositoryCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Get project and GitHub account
        project = get_object_or_404(Project, id=serializer.validated_data['project_id'])
        github_account = get_object_or_404(GitHubAccount, user=request.user)
        
        # Check if repository already exists for this project
        if GitHubRepository.objects.filter(project=project).exists():
            return Response(
                {'error': 'Repository already exists for this project'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # Create repository using GitHub API
            client = GitHubClient(github_account.get_access_token())
            repo_data = client.create_repository(
                name=serializer.validated_data['name'],
                description=serializer.validated_data.get('description', ''),
                private=serializer.validated_data.get('private', True),
                auto_init=serializer.validated_data.get('auto_init', True)
            )
            
            # Save repository information
            repository = GitHubRepository.objects.create(
                project=project,
                github_account=github_account,
                repo_id=repo_data['id'],
                name=repo_data['name'],
                full_name=repo_data['full_name'],
                html_url=repo_data['html_url'],
                clone_url=repo_data['clone_url'],
                default_branch=repo_data['default_branch'],
                is_private=repo_data['private']
            )
            
            return Response(
                GitHubRepositorySerializer(repository).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            import traceback
            error_msg = str(e) if str(e) else repr(e)
            error_trace = traceback.format_exc()
            logger.error(f"Error creating GitHub repository: {error_msg}\n{error_trace}")
            return Response(
                {'error': error_msg, 'detail': error_trace if settings.DEBUG else 'Internal server error'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['post'])
    def commit_file(self, request, pk=None):
        """Commit a file to the repository"""
        repository = self.get_object()
        serializer = CommitFileSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        try:
            # Get GitHub client
            github_account = repository.github_account
            client = GitHubClient(github_account.get_access_token())
            
            # Commit file
            commit_data = client.create_or_update_file(
                repo_name=repository.full_name,
                file_path=serializer.validated_data['file_path'],
                content=serializer.validated_data['content'],
                commit_message=serializer.validated_data['commit_message'],
                branch=serializer.validated_data.get('branch', 'main')
            )
            
            # Save commit information
            commit = GitHubCommit.objects.create(
                repository=repository,
                sha=commit_data['commit'],
                message=serializer.validated_data['commit_message'],
                author=github_account.username,
                branch=serializer.validated_data.get('branch', 'main'),
                file_path=serializer.validated_data['file_path']
            )
            
            return Response(
                GitHubCommitSerializer(commit).data,
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def commits(self, request, pk=None):
        """Get all commits for a repository"""
        repository = self.get_object()
        commits = GitHubCommit.objects.filter(repository=repository)
        serializer = GitHubCommitSerializer(commits, many=True)
        return Response(serializer.data)


class GitHubCommitViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for GitHub commits"""
    serializer_class = GitHubCommitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return GitHubCommit.objects.filter(
            repository__github_account__user=user
        )


# Made with Bob