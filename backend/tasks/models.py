from django.db import models
from projects.models import Project
from agents.models import Agent


class Task(models.Model):
    """Task model for agent work items"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In Progress'),
        ('review', 'Review'),
        ('completed', 'Completed'),
        ('blocked', 'Blocked'),
        ('failed', 'Failed'),
    ]
    
    PRIORITY_CHOICES = [
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ]
    
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    assigned_to = models.ForeignKey(Agent, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    progress = models.IntegerField(default=0)  # 0-100
    dependencies = models.ManyToManyField('self', symmetrical=False, blank=True, related_name='dependent_tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-priority', '-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"


class TaskOutput(models.Model):
    """Output/result from a completed task"""
    
    OUTPUT_TYPE_CHOICES = [
        ('code', 'Code'),
        ('design', 'Design'),
        ('document', 'Document'),
        ('analysis', 'Analysis'),
    ]
    
    task = models.OneToOneField(Task, on_delete=models.CASCADE, related_name='output')
    output_type = models.CharField(max_length=20, choices=OUTPUT_TYPE_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(default=dict)  # Additional metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Output for {self.task.title}"


class OutputFile(models.Model):
    """Individual files in task output"""
    
    task_output = models.ForeignKey(TaskOutput, on_delete=models.CASCADE, related_name='files')
    name = models.CharField(max_length=255)
    path = models.CharField(max_length=500)
    content = models.TextField()
    language = models.CharField(max_length=50, blank=True)  # Programming language
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['path', 'name']
    
    def __str__(self):
        return f"{self.path}/{self.name}"

# Made with Bob
