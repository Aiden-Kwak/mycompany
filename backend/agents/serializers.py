from rest_framework import serializers
from .models import Agent, AIServiceAPIKey
from .api_keys import AIServiceConfig


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


class AIServiceInfoSerializer(serializers.Serializer):
    """Serializer for AI service information"""
    service_type = serializers.CharField()
    name = serializers.CharField()
    description = serializers.CharField()
    signup_url = serializers.URLField()
    docs_url = serializers.URLField()
    key_format = serializers.CharField()


class AIServiceAPIKeySerializer(serializers.ModelSerializer):
    """Serializer for AI service API keys"""
    service_name = serializers.CharField(source='get_service_type_display', read_only=True)
    api_key = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = AIServiceAPIKey
        fields = [
            'id', 'service_type', 'service_name', 'is_active',
            'created_at', 'updated_at', 'last_used_at', 'api_key'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_used_at']
    
    def create(self, validated_data):
        api_key = validated_data.pop('api_key', None)
        if not api_key:
            raise serializers.ValidationError({"api_key": "API key is required"})
        
        # Validate key format
        service_type = validated_data.get('service_type')
        if not AIServiceConfig.validate_key_format(service_type, api_key):
            service_info = AIServiceConfig.get_service_info(service_type)
            raise serializers.ValidationError({
                "api_key": f"Invalid API key format. Expected format: {service_info.get('key_format', 'N/A')}"
            })
        
        instance = AIServiceAPIKey.objects.create(**validated_data)
        instance.set_api_key(api_key)
        instance.save()
        return instance
    
    def update(self, instance, validated_data):
        api_key = validated_data.pop('api_key', None)
        if api_key:
            # Validate key format
            service_type = validated_data.get('service_type', instance.service_type)
            if not AIServiceConfig.validate_key_format(service_type, api_key):
                service_info = AIServiceConfig.get_service_info(service_type)
                raise serializers.ValidationError({
                    "api_key": f"Invalid API key format. Expected format: {service_info.get('key_format', 'N/A')}"
                })
            instance.set_api_key(api_key)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

# Made with Bob
