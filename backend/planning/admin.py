from django.contrib import admin
from .models import PlanningDocument, AgentRecommendation


@admin.register(PlanningDocument)
class PlanningDocumentAdmin(admin.ModelAdmin):
    list_display = ['project', 'complexity', 'tokens_used', 'created_at']
    list_filter = ['complexity', 'created_at']
    search_fields = ['project__name', 'executive_summary']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(AgentRecommendation)
class AgentRecommendationAdmin(admin.ModelAdmin):
    list_display = ['role', 'planning_document', 'priority', 'estimated_workload']
    list_filter = ['priority', 'role']
    search_fields = ['role', 'reason']

# Made with Bob
