from django.contrib import admin
from .models import GitHubAccount, GitHubRepository, GitHubCommit


@admin.register(GitHubAccount)
class GitHubAccountAdmin(admin.ModelAdmin):
    list_display = ['username', 'github_id', 'email', 'user', 'created_at']
    search_fields = ['username', 'email', 'github_id']
    readonly_fields = ['github_id', 'created_at', 'updated_at']
    list_filter = ['created_at']


@admin.register(GitHubRepository)
class GitHubRepositoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'full_name', 'github_account', 'is_private', 'created_at']
    search_fields = ['name', 'full_name']
    readonly_fields = ['repo_id', 'created_at', 'updated_at']
    list_filter = ['is_private', 'created_at']


@admin.register(GitHubCommit)
class GitHubCommitAdmin(admin.ModelAdmin):
    list_display = ['sha_short', 'message_short', 'author', 'branch', 'repository', 'created_at']
    search_fields = ['sha', 'message', 'author']
    readonly_fields = ['sha', 'created_at']
    list_filter = ['branch', 'created_at']
    
    def sha_short(self, obj):
        return obj.sha[:7]
    sha_short.short_description = 'SHA'
    
    def message_short(self, obj):
        return obj.message[:50] + '...' if len(obj.message) > 50 else obj.message
    message_short.short_description = 'Message'


# Made with Bob