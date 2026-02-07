from rest_framework import serializers
from .models import GitHubAccount, GitHubRepository, GitHubCommit


class GitHubAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = GitHubAccount
        fields = ['id', 'github_id', 'username', 'email', 'avatar_url', 'created_at']
        read_only_fields = ['id', 'github_id', 'created_at']


class GitHubRepositorySerializer(serializers.ModelSerializer):
    github_account_username = serializers.CharField(source='github_account.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = GitHubRepository
        fields = [
            'id', 'project', 'github_account', 'github_account_username',
            'project_name', 'repo_id', 'name', 'full_name', 'html_url',
            'clone_url', 'default_branch', 'is_private', 'created_at'
        ]
        read_only_fields = ['id', 'repo_id', 'created_at']


class GitHubCommitSerializer(serializers.ModelSerializer):
    repository_name = serializers.CharField(source='repository.full_name', read_only=True)
    sha_short = serializers.SerializerMethodField()
    
    class Meta:
        model = GitHubCommit
        fields = [
            'id', 'repository', 'repository_name', 'sha', 'sha_short',
            'message', 'author', 'branch', 'file_path', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_sha_short(self, obj):
        return obj.sha[:7]


class RepositoryCreateSerializer(serializers.Serializer):
    """Serializer for creating a new GitHub repository"""
    project_id = serializers.IntegerField()
    name = serializers.CharField(max_length=255)
    description = serializers.CharField(required=False, allow_blank=True)
    private = serializers.BooleanField(default=True)
    auto_init = serializers.BooleanField(default=True)


class CommitFileSerializer(serializers.Serializer):
    """Serializer for committing a file to GitHub"""
    repository_id = serializers.IntegerField()
    file_path = serializers.CharField(max_length=500)
    content = serializers.CharField()
    commit_message = serializers.CharField()
    branch = serializers.CharField(default='main')


# Made with Bob