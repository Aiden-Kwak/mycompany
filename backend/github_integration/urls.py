from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import GitHubAccountViewSet, GitHubRepositoryViewSet, GitHubCommitViewSet

router = DefaultRouter()
router.register(r'accounts', GitHubAccountViewSet, basename='github-account')
router.register(r'repositories', GitHubRepositoryViewSet, basename='github-repository')
router.register(r'commits', GitHubCommitViewSet, basename='github-commit')

urlpatterns = [
    path('', include(router.urls)),
]

# Made with Bob