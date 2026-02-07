from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Agent
from .serializers import AgentSerializer, AgentCreateSerializer


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

# Made with Bob
