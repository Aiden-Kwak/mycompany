"""
GitHub integration signals
Automatically create GitHubAccount when user connects via OAuth
"""
from django.dispatch import receiver
from allauth.socialaccount.signals import pre_social_login
from allauth.socialaccount.models import SocialAccount
from .models import GitHubAccount
import logging

logger = logging.getLogger(__name__)


@receiver(pre_social_login)
def create_github_account(sender, request, sociallogin, **kwargs):
    """
    Create or update GitHubAccount when user logs in with GitHub
    """
    # Only process GitHub logins
    if sociallogin.account.provider != 'github':
        return
    
    user = sociallogin.user
    
    # Skip if user is not saved yet (during signup)
    if not user.pk:
        return
    
    # Get GitHub account data
    github_data = sociallogin.account.extra_data
    github_id = github_data.get('id')
    username = github_data.get('login')
    email = github_data.get('email', '')
    avatar_url = github_data.get('avatar_url', '')
    
    # Get access token from sociallogin
    access_token = sociallogin.token.token if sociallogin.token else None
    
    if not access_token:
        logger.warning(f"No access token found for user {user.username}")
        return
    
    # Create or update GitHubAccount
    github_account, created = GitHubAccount.objects.update_or_create(
        user=user,
        defaults={
            'github_id': github_id,
            'username': username,
            'email': email,
            'avatar_url': avatar_url,
        }
    )
    
    # Set encrypted access token
    github_account.set_access_token(access_token)
    github_account.save()
    
    action = "Created" if created else "Updated"
    logger.info(f"{action} GitHubAccount for user {user.username} (GitHub: {username})")


# Made with Bob