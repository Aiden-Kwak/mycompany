from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import logout
from django.views.decorators.csrf import ensure_csrf_cookie
from django.utils.decorators import method_decorator


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def current_user(request):
    """Get current authenticated user info"""
    if request.user.is_authenticated:
        # Get GitHub social account if exists
        github_account = None
        try:
            from allauth.socialaccount.models import SocialAccount
            github_account = SocialAccount.objects.filter(
                user=request.user,
                provider='github'
            ).first()
        except:
            pass
        
        return Response({
            'isAuthenticated': True,
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'github': {
                    'login': github_account.extra_data.get('login') if github_account else None,
                    'avatar_url': github_account.extra_data.get('avatar_url') if github_account else None,
                } if github_account else None
            }
        })
    
    return Response({
        'isAuthenticated': False,
        'user': None
    })


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_view(request):
    """Logout current user"""
    logout(request)
    return Response({
        'success': True,
        'message': 'Logged out successfully'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
@ensure_csrf_cookie
def csrf_token(request):
    """Get CSRF token - this endpoint ensures CSRF cookie is set"""
    return Response({
        'detail': 'CSRF cookie set'
    })


# Made with Bob