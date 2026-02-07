from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Project, ProjectRequirement
from .serializers import ProjectSerializer, ProjectCreateSerializer, ProjectRequirementSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def perform_create(self, serializer):
        # For now, we'll use a default user. Later, we'll use request.user
        from django.contrib.auth.models import User
        user, _ = User.objects.get_or_create(username='default_user')
        serializer.save(created_by=user)
    
    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        """Get all requirements for a project"""
        project = self.get_object()
        requirements = project.requirements.all()
        serializer = ProjectRequirementSerializer(requirements, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get project statistics"""
        project = self.get_object()
        stats = {
            'total_agents': project.agents.count(),
            'active_agents': project.agents.filter(status='working').count(),
            'total_tasks': project.tasks.count(),
            'completed_tasks': project.tasks.filter(status='completed').count(),
            'in_progress_tasks': project.tasks.filter(status='in_progress').count(),
            'completion_rate': 0,
        }
        
        if stats['total_tasks'] > 0:
            stats['completion_rate'] = round(
                (stats['completed_tasks'] / stats['total_tasks']) * 100, 2
            )
        
        return Response(stats)

# Made with Bob
