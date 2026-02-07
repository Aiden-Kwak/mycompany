from rest_framework import serializers
from .models import Project, ProjectRequirement


class ProjectRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectRequirement
        fields = ['id', 'category', 'question', 'answer', 'priority', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    requirements = ProjectRequirementSerializer(many=True, read_only=True)
    agent_count = serializers.SerializerMethodField()
    task_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'status', 'github_repo',
            'created_by', 'created_at', 'updated_at',
            'requirements', 'agent_count', 'task_count'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']
    
    def get_agent_count(self, obj):
        return obj.agents.count()
    
    def get_task_count(self, obj):
        return obj.tasks.count()


class ProjectCreateSerializer(serializers.ModelSerializer):
    requirements = ProjectRequirementSerializer(many=True, required=False)
    
    class Meta:
        model = Project
        fields = ['name', 'description', 'github_repo', 'requirements']
    
    def create(self, validated_data):
        requirements_data = validated_data.pop('requirements', [])
        project = Project.objects.create(**validated_data)
        
        for req_data in requirements_data:
            ProjectRequirement.objects.create(project=project, **req_data)
        
        return project

# Made with Bob
