from django.urls import path
from . import views

urlpatterns = [
    path('user/', views.current_user, name='current-user'),
    path('logout/', views.logout_view, name='logout'),
    path('csrf/', views.csrf_token, name='csrf-token'),
]

# Made with Bob