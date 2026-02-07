"""
Planning Document Models
"""
from django.db import models
from projects.models import Project


class PlanningDocument(models.Model):
    """Product Requirements Document (PRD) for a project"""
    
    project = models.OneToOneField(
        Project,
        on_delete=models.CASCADE,
        related_name='planning_document'
    )
    
    # Analysis Results
    tech_stack = models.JSONField(default=dict)
    required_roles = models.JSONField(default=list)
    complexity = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Low'),
            ('medium', 'Medium'),
            ('high', 'High'),
        ],
        default='medium'
    )
    key_features = models.JSONField(default=list)
    challenges = models.JSONField(default=list)
    
    # PRD Content
    executive_summary = models.TextField(blank=True)
    technical_requirements = models.TextField(blank=True)
    feature_specifications = models.TextField(blank=True)
    development_plan = models.TextField(blank=True)
    timeline = models.TextField(blank=True)
    
    # Full PRD in Markdown
    full_document = models.TextField(blank=True)
    
    # Metadata
    tokens_used = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"PRD for {self.project.name}"


class AgentRecommendation(models.Model):
    """Recommended agents for a project based on PRD analysis"""
    
    planning_document = models.ForeignKey(
        PlanningDocument,
        on_delete=models.CASCADE,
        related_name='agent_recommendations'
    )
    
    role = models.CharField(max_length=50)
    reason = models.TextField()
    priority = models.CharField(
        max_length=10,
        choices=[
            ('high', 'High'),
            ('medium', 'Medium'),
            ('low', 'Low'),
        ],
        default='medium'
    )
    skills = models.JSONField(default=list)
    estimated_workload = models.IntegerField(default=0)  # in hours
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-priority', 'role']
    
    def __str__(self):
        return f"{self.role} for {self.planning_document.project.name}"

# Made with Bob
