"""
Planning URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlanningDocumentViewSet

router = DefaultRouter()
router.register(r'planning', PlanningDocumentViewSet, basename='planning')

urlpatterns = [
    path('', include(router.urls)),
]

# Made with Bob
