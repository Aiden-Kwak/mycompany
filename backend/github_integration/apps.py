from django.apps import AppConfig


class GithubConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'github_integration'
    verbose_name = 'GitHub Integration'
    
    def ready(self):
        """Import signals when app is ready"""
        import github_integration.signals  # noqa

# Made with Bob
