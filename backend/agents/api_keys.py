"""
API Key Management for AI Services
"""
from cryptography.fernet import Fernet
from django.conf import settings
import os


class APIKeyEncryption:
    """Encrypt and decrypt API keys"""
    
    @staticmethod
    def get_cipher():
        """Get or create encryption key"""
        key = os.environ.get('API_KEY_ENCRYPTION_KEY')
        if not key:
            # Generate a new key if not exists
            key = Fernet.generate_key().decode()
            print(f"⚠️  Generated new encryption key. Add to .env: API_KEY_ENCRYPTION_KEY={key}")
        return Fernet(key.encode() if isinstance(key, str) else key)
    
    @staticmethod
    def encrypt_key(api_key: str) -> str:
        """Encrypt an API key"""
        cipher = APIKeyEncryption.get_cipher()
        return cipher.encrypt(api_key.encode()).decode()
    
    @staticmethod
    def decrypt_key(encrypted_key: str) -> str:
        """Decrypt an API key"""
        cipher = APIKeyEncryption.get_cipher()
        return cipher.decrypt(encrypted_key.encode()).decode()


class AIServiceConfig:
    """Configuration for different AI services"""
    
    SERVICES = {
        'opencode': {
            'name': 'OpenCode',
            'description': 'OpenCode API for code generation',
            'signup_url': 'https://opencode.ai/signup',
            'docs_url': 'https://docs.opencode.ai',
            'key_format': 'oc-*',
        },
        'openai': {
            'name': 'OpenAI',
            'description': 'OpenAI GPT models',
            'signup_url': 'https://platform.openai.com/signup',
            'docs_url': 'https://platform.openai.com/docs',
            'key_format': 'sk-*',
        },
        'anthropic': {
            'name': 'Anthropic Claude',
            'description': 'Anthropic Claude models',
            'signup_url': 'https://console.anthropic.com/signup',
            'docs_url': 'https://docs.anthropic.com',
            'key_format': 'sk-ant-*',
        },
        'google': {
            'name': 'Google AI',
            'description': 'Google Gemini models',
            'signup_url': 'https://makersuite.google.com/app/apikey',
            'docs_url': 'https://ai.google.dev/docs',
            'key_format': 'AI*',
        },
    }
    
    @classmethod
    def get_service_info(cls, service_type: str) -> dict:
        """Get information about an AI service"""
        return cls.SERVICES.get(service_type, {})
    
    @classmethod
    def validate_key_format(cls, service_type: str, api_key: str) -> bool:
        """Validate API key format for a service"""
        service = cls.SERVICES.get(service_type)
        if not service:
            return False
        
        key_format = service.get('key_format', '')
        if '*' in key_format:
            prefix = key_format.split('*')[0]
            return api_key.startswith(prefix)
        
        return True

# Made with Bob