from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Agent, AIServiceAPIKey
from .serializers import (
    AgentSerializer,
    AgentCreateSerializer,
    AIServiceAPIKeySerializer,
    AIServiceInfoSerializer
)
from .api_keys import AIServiceConfig


class AgentViewSet(viewsets.ModelViewSet):
    queryset = Agent.objects.all()
    serializer_class = AgentSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return AgentCreateSerializer
        return AgentSerializer
    
    def get_queryset(self):
        queryset = Agent.objects.all()
        project_id = self.request.query_params.get('project', None)
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update agent status"""
        agent = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in ['idle', 'working', 'completed', 'error']:
            return Response(
                {'error': 'Invalid status'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        agent.status = new_status
        agent.save()
        
        serializer = self.get_serializer(agent)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def tasks(self, request, pk=None):
        """Get all tasks assigned to this agent"""
        agent = self.get_object()
        from tasks.serializers import TaskSerializer
        tasks = agent.tasks.all()
        serializer = TaskSerializer(tasks, many=True)
        return Response(serializer.data)


class AIServiceAPIKeyViewSet(viewsets.ModelViewSet):
    """ViewSet for managing AI service API keys"""
    serializer_class = AIServiceAPIKeySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Return API keys for the current user"""
        return AIServiceAPIKey.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        """Set the user when creating an API key"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def services(self, request):
        """Get list of available AI services"""
        services = []
        for service_type, service_info in AIServiceConfig.SERVICES.items():
            services.append({
                'service_type': service_type,
                **service_info
            })
        serializer = AIServiceInfoSerializer(services, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active API keys for the current user"""
        active_keys = self.get_queryset().filter(is_active=True)
        serializer = self.get_serializer(active_keys, many=True)
        return Response(serializer.data)

# Made with Bob
