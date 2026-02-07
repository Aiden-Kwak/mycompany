from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Task
from .serializers import TaskSerializer, TaskCreateSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    def get_queryset(self):
        queryset = Task.objects.all()
        project_id = self.request.query_params.get('project', None)
        agent_id = self.request.query_params.get('agent', None)
        
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if agent_id:
            queryset = queryset.filter(assigned_to_id=agent_id)
            
        return queryset.order_by('-priority', '-created_at')
    
    @action(detail=True, methods=['post'])
    def update_progress(self, request, pk=None):
        """Update task progress"""
        task = self.get_object()
        progress = request.data.get('progress')
        
        if not isinstance(progress, int) or progress < 0 or progress > 100:
            return Response(
                {'error': 'Progress must be between 0 and 100'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.progress = progress
        if progress == 100 and task.status != 'completed':
            task.status = 'completed'
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update task status"""
        task = self.get_object()
        new_status = request.data.get('status')
        
        valid_statuses = ['pending', 'in_progress', 'review', 'completed', 'blocked', 'failed']
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        task.status = new_status
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)

# Made with Bob
