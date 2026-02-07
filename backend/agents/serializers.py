from rest_framework import serializers
from .models import Agent


class AgentSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    department_display = serializers.CharField(source='get_department_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    task_count = serializers.SerializerMethodField()
    completed_tasks = serializers.SerializerMethodField()
    
    class Meta:
        model = Agent
        fields = [
            'id', 'project', 'name', 'role', 'role_display',
            'department', 'department_display', 'status', 'status_display',
            'avatar', 'skills', 'created_at', 'updated_at',
            'task_count', 'completed_tasks'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_task_count(self, obj):
        return obj.tasks.count()
    
    def get_completed_tasks(self, obj):
        return obj.tasks.filter(status='completed').count()


class AgentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Agent
        fields = ['project', 'name', 'role', 'department', 'avatar', 'skills']
    
    def validate_skills(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Skills must be a list")
        return value

# Made with Bob
