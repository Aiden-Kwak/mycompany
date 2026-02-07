"""
Planning Views
API endpoints for planning document generation
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from projects.models import Project
from .models import PlanningDocument
from .serializers import PlanningDocumentSerializer, PlanningDocumentDetailSerializer
from .services import generate_project_plan


class PlanningDocumentViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for planning documents"""
    
    queryset = PlanningDocument.objects.all()
    serializer_class = PlanningDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return PlanningDocumentDetailSerializer
        return PlanningDocumentSerializer
    
    def get_queryset(self):
        """Filter by user's projects"""
        return PlanningDocument.objects.filter(
            project__created_by=self.request.user
        )
    
    @action(detail=False, methods=['post'], url_path='generate')
    def generate(self, request):
        """
        Generate planning document for a project
        
        POST /api/planning/generate/
        Body: {"project_id": 1}
        """
        project_id = request.data.get('project_id')
        
        if not project_id:
            return Response(
                {'error': 'project_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verify project belongs to user
        project = get_object_or_404(
            Project,
            id=project_id,
            created_by=request.user
        )
        
        # Check if planning document already exists
        existing = PlanningDocument.objects.filter(project=project).first()
        if existing:
            return Response(
                {
                    'message': 'Planning document already exists',
                    'planning_document': PlanningDocumentDetailSerializer(existing).data
                },
                status=status.HTTP_200_OK
            )
        
        # Generate planning document
        try:
            result = generate_project_plan(project_id)
            
            if result['success']:
                planning_doc = result['planning_document']
                return Response(
                    {
                        'message': 'Planning document generated successfully',
                        'planning_document': PlanningDocumentDetailSerializer(planning_doc).data,
                        'agents_created': result['agents_created'],
                    },
                    status=status.HTTP_201_CREATED
                )
            else:
                return Response(
                    {'error': result['error']},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['get'], url_path='by-project/(?P<project_id>[^/.]+)')
    def by_project(self, request, project_id=None):
        """
        Get planning document for a specific project
        
        GET /api/planning/by-project/{project_id}/
        """
        project = get_object_or_404(
            Project,
            id=project_id,
            created_by=request.user
        )
        
        planning_doc = PlanningDocument.objects.filter(project=project).first()
        
        if not planning_doc:
            return Response(
                {'message': 'No planning document found for this project'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = PlanningDocumentDetailSerializer(planning_doc)
        return Response(serializer.data)

# Made with Bob
