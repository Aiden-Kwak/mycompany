"""
Planning Serializers
"""
from rest_framework import serializers
from .models import PlanningDocument, AgentRecommendation


class AgentRecommendationSerializer(serializers.ModelSerializer):
    """Serializer for agent recommendations"""
    
    class Meta:
        model = AgentRecommendation
        fields = [
            'id',
            'role',
            'reason',
            'priority',
            'skills',
            'estimated_workload',
            'created_at',
        ]


class PlanningDocumentSerializer(serializers.ModelSerializer):
    """Serializer for planning documents"""
    
    agent_recommendations = AgentRecommendationSerializer(many=True, read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    
    class Meta:
        model = PlanningDocument
        fields = [
            'id',
            'project',
            'project_name',
            'tech_stack',
            'required_roles',
            'complexity',
            'key_features',
            'challenges',
            'executive_summary',
            'technical_requirements',
            'feature_specifications',
            'development_plan',
            'timeline',
            'full_document',
            'tokens_used',
            'agent_recommendations',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at']


class PlanningDocumentDetailSerializer(PlanningDocumentSerializer):
    """Detailed serializer with full content"""
    
    class Meta(PlanningDocumentSerializer.Meta):
        fields = PlanningDocumentSerializer.Meta.fields

# Made with Bob
