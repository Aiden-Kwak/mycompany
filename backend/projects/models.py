from django.db import models
from django.contrib.auth.models import User


class Project(models.Model):
    """Main project model"""
    
    STATUS_CHOICES = [
        ('planning', 'Planning'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planning')
    github_repo = models.URLField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class ProjectRequirement(models.Model):
    """Survey answers/requirements for a project"""
    
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='requirements')
    category = models.CharField(max_length=100)
    question = models.TextField()
    answer = models.TextField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['category', 'created_at']
    
    def __str__(self):
        return f"{self.project.name} - {self.category}"

# Made with Bob
