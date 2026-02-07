from django.contrib import admin
from .models import Agent, AIServiceAPIKey


@admin.register(Agent)
class AgentAdmin(admin.ModelAdmin):
    list_display = ['name', 'role', 'department', 'status', 'project', 'created_at']
    list_filter = ['role', 'department', 'status']
    search_fields = ['name', 'project__name']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AIServiceAPIKey)
class AIServiceAPIKeyAdmin(admin.ModelAdmin):
    list_display = ['user', 'service_type', 'is_active', 'created_at', 'last_used_at']
    list_filter = ['service_type', 'is_active']
    search_fields = ['user__username', 'user__email']
    readonly_fields = ['created_at', 'updated_at', 'encrypted_key']
    
    def has_change_permission(self, request, obj=None):
        # Only allow users to edit their own API keys
        if obj and obj.user != request.user and not request.user.is_superuser:
            return False
        return super().has_change_permission(request, obj)

# Made with Bob
