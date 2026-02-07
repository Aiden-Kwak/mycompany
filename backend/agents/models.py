from django.db import models
from projects.models import Project


class Agent(models.Model):
    """AI Agent model"""
    
    ROLE_CHOICES = [
        ('product_manager', 'Product Manager'),
        ('ui_ux_designer', 'UI/UX Designer'),
        ('frontend_developer', 'Frontend Developer'),
        ('backend_developer', 'Backend Developer'),
        ('qa_engineer', 'QA Engineer'),
        ('devops_engineer', 'DevOps Engineer'),
        ('data_analyst', 'Data Analyst'),
    ]
    
    DEPARTMENT_CHOICES = [
        ('development', 'Development'),
        ('design', 'Design'),
        ('marketing', 'Marketing'),
        ('sales', 'Sales'),
        ('hr', 'Human Resources'),
        ('finance', 'Finance'),
        ('support', 'Customer Support'),
    ]
    
    STATUS_CHOICES = [
        ('idle', 'Idle'),
        ('working', 'Working'),
        ('completed', 'Completed'),
        ('error', 'Error'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='agents')
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES)
    department = models.CharField(max_length=50, choices=DEPARTMENT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='idle')
    avatar = models.CharField(max_length=10, default='🤖')  # Emoji avatar
    skills = models.JSONField(default=list)  # List of skills
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['department', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_role_display()})"

# Made with Bob
