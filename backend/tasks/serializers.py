from rest_framework import serializers
from .models import Task, TaskOutput, OutputFile


class OutputFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = OutputFile
        fields = ['id', 'name', 'path', 'content', 'language', 'created_at']
        read_only_fields = ['id', 'created_at']


class TaskOutputSerializer(serializers.ModelSerializer):
    files = OutputFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = TaskOutput
        fields = ['id', 'output_type', 'content', 'metadata', 'files', 'created_at']
        read_only_fields = ['id', 'created_at']


class TaskSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    output = TaskOutputSerializer(read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.name', read_only=True)
    
    class Meta:
        model = Task
        fields = [
            'id', 'project', 'assigned_to', 'assigned_to_name',
            'title', 'description', 'status', 'status_display',
            'priority', 'priority_display', 'progress',
            'dependencies', 'created_at', 'updated_at', 'completed_at',
            'output'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TaskCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['project', 'assigned_to', 'title', 'description', 'priority', 'dependencies']

# Made with Bob
