from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Count, Q, Avg
from .models import Project
from .serializers import ProjectSerializer, ProjectCreateSerializer
from agents.models import Agent
from tasks.models import Task


class ProjectViewSet(viewsets.ModelViewSet):
    def get_permissions(self):
        """
        Allow anyone to view projects and stats,
        but require authentication for create/update/delete
        """
        if self.action in ['list', 'retrieve', 'stats', 'dashboard_stats']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ProjectCreateSerializer
        return ProjectSerializer
    
    def get_queryset(self):
        return Project.objects.all().order_by('-created_at')
    
    def perform_create(self, serializer):
        """Set the created_by field to the current user"""
        if not self.request.user.is_authenticated:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must be logged in to create a project.")
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'], url_path='stats')
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        # Total agents count
        total_agents = Agent.objects.count()
        
        # Active tasks count (not completed or failed)
        active_tasks = Task.objects.filter(
            status__in=['pending', 'in_progress']
        ).count()
        
        # Completion rate
        total_tasks = Task.objects.count()
        completed_tasks = Task.objects.filter(status='completed').count()
        completion_rate = round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
        
        # GitHub repos count (projects with github_repository)
        github_repos = Project.objects.filter(
            github_repository__isnull=False
        ).count()
        
        # Department statistics
        departments = []
        dept_mapping = {
            'development': {'name': 'Development', 'icon': '💻', 'color': 'from-blue-500 to-blue-600', 'bgColor': 'bg-blue-50'},
            'design': {'name': 'Design', 'icon': '🎨', 'color': 'from-purple-500 to-purple-600', 'bgColor': 'bg-purple-50'},
            'marketing': {'name': 'Marketing', 'icon': '📢', 'color': 'from-pink-500 to-pink-600', 'bgColor': 'bg-pink-50'},
            'sales': {'name': 'Sales', 'icon': '💼', 'color': 'from-green-500 to-green-600', 'bgColor': 'bg-green-50'},
            'hr': {'name': 'Human Resources', 'icon': '👥', 'color': 'from-orange-500 to-orange-600', 'bgColor': 'bg-orange-50'},
            'finance': {'name': 'Finance', 'icon': '💰', 'color': 'from-yellow-500 to-yellow-600', 'bgColor': 'bg-yellow-50'},
            'support': {'name': 'Customer Support', 'icon': '🎧', 'color': 'from-teal-500 to-teal-600', 'bgColor': 'bg-teal-50'},
        }
        
        for dept_id, dept_info in dept_mapping.items():
            # Count agents in this department
            agents_count = Agent.objects.filter(department=dept_id).count()
            
            # Count tasks for agents in this department
            tasks_count = Task.objects.filter(
                assigned_to__department=dept_id,
                status__in=['pending', 'in_progress']
            ).count()
            
            # Calculate progress (completed tasks / total tasks)
            dept_total_tasks = Task.objects.filter(assigned_to__department=dept_id).count()
            dept_completed_tasks = Task.objects.filter(
                assigned_to__department=dept_id,
                status='completed'
            ).count()
            progress = round((dept_completed_tasks / dept_total_tasks * 100) if dept_total_tasks > 0 else 0)
            
            departments.append({
                'id': dept_id,
                'name': dept_info['name'],
                'icon': dept_info['icon'],
                'color': dept_info['color'],
                'bgColor': dept_info['bgColor'],
                'agents': agents_count,
                'tasks': tasks_count,
                'progress': progress,
            })
        
        return Response({
            'stats': {
                'totalAgents': total_agents,
                'activeTasks': active_tasks,
                'completionRate': completion_rate,
                'githubRepos': github_repos,
            },
            'departments': departments,
        })
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get statistics for a specific project"""
        project = self.get_object()
        
        # Count agents in this project
        total_agents = project.agents.count()
        active_agents = project.agents.filter(status='working').count()
        
        # Count tasks
        total_tasks = project.tasks.count()
        completed_tasks = project.tasks.filter(status='completed').count()
        in_progress_tasks = project.tasks.filter(status='in_progress').count()
        
        # Calculate completion rate
        completion_rate = round((completed_tasks / total_tasks * 100) if total_tasks > 0 else 0)
        
        return Response({
            'total_agents': total_agents,
            'active_agents': active_agents,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'in_progress_tasks': in_progress_tasks,
            'completion_rate': completion_rate,
        })


# Made with Bob
