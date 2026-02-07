"""
OpenCode API Client
Wrapper for OpenCode API interactions
"""
import os
import requests
from typing import Dict, List, Optional, Generator
from django.conf import settings
import json


class OpenCodeClient:
    """Client for interacting with OpenCode API"""
    
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.environ.get('OPENCODE_API_KEY')
        self.base_url = os.environ.get('OPENCODE_API_URL', 'https://api.opencode.com/v1')
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
        }
    
    def test_connection(self) -> Dict:
        """Test API connection"""
        try:
            response = requests.get(
                f'{self.base_url}/models',
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return {
                'success': True,
                'message': 'Connection successful',
                'models': response.json()
            }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'message': f'Connection failed: {str(e)}',
                'models': []
            }
    
    def list_models(self) -> List[Dict]:
        """Get list of available models"""
        try:
            response = requests.get(
                f'{self.base_url}/models',
                headers=self.headers,
                timeout=10
            )
            response.raise_for_status()
            return response.json().get('data', [])
        except requests.exceptions.RequestException as e:
            print(f"Error fetching models: {e}")
            return []
    
    def generate_code(
        self,
        prompt: str,
        model: str = 'gpt-4-turbo',
        temperature: float = 0.7,
        max_tokens: int = 2000,
        stream: bool = False
    ) -> Dict:
        """
        Generate code using OpenCode API
        
        Args:
            prompt: The prompt for code generation
            model: Model to use
            temperature: Sampling temperature (0-1)
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
        
        Returns:
            Generated code and metadata
        """
        payload = {
            'model': model,
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'temperature': temperature,
            'max_tokens': max_tokens,
            'stream': stream
        }
        
        try:
            if stream:
                return self._stream_generate(payload)
            else:
                response = requests.post(
                    f'{self.base_url}/chat/completions',
                    headers=self.headers,
                    json=payload,
                    timeout=60
                )
                response.raise_for_status()
                data = response.json()
                
                return {
                    'success': True,
                    'content': data['choices'][0]['message']['content'],
                    'model': data['model'],
                    'tokens_used': data.get('usage', {}).get('total_tokens', 0),
                    'finish_reason': data['choices'][0].get('finish_reason')
                }
        except requests.exceptions.RequestException as e:
            return {
                'success': False,
                'error': str(e),
                'content': None
            }
    
    def _stream_generate(self, payload: Dict) -> Generator:
        """Stream generation response"""
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers=self.headers,
                json=payload,
                stream=True,
                timeout=60
            )
            response.raise_for_status()
            
            for line in response.iter_lines():
                if line:
                    line = line.decode('utf-8')
                    if line.startswith('data: '):
                        data = line[6:]
                        if data == '[DONE]':
                            break
                        try:
                            chunk = json.loads(data)
                            content = chunk['choices'][0]['delta'].get('content', '')
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
        except requests.exceptions.RequestException as e:
            yield f"Error: {str(e)}"
    
    def analyze_requirements(self, requirements: List[Dict]) -> Dict:
        """
        Analyze project requirements and generate recommendations
        
        Args:
            requirements: List of requirement dictionaries
        
        Returns:
            Analysis results with recommendations
        """
        requirements_text = "\n".join([
            f"- {req['question']}: {req['answer']}"
            for req in requirements
        ])
        
        prompt = f"""
Analyze the following project requirements and provide:
1. Technical stack recommendations
2. Required team roles
3. Estimated complexity
4. Key features to implement
5. Potential challenges

Requirements:
{requirements_text}

Provide your analysis in JSON format with the following structure:
{{
    "tech_stack": {{
        "frontend": ["framework1", "library1"],
        "backend": ["framework1", "library1"],
        "database": "database_name",
        "other": ["tool1", "tool2"]
    }},
    "required_roles": [
        {{"role": "role_name", "reason": "why needed"}}
    ],
    "complexity": "low|medium|high",
    "key_features": ["feature1", "feature2"],
    "challenges": ["challenge1", "challenge2"]
}}
"""
        
        result = self.generate_code(
            prompt=prompt,
            model='gpt-4',
            temperature=0.3,
            max_tokens=1500
        )
        
        if result['success']:
            try:
                # Extract JSON from response
                content = result['content']
                # Find JSON block
                start = content.find('{')
                end = content.rfind('}') + 1
                if start != -1 and end > start:
                    json_str = content[start:end]
                    analysis = json.loads(json_str)
                    return {
                        'success': True,
                        'analysis': analysis,
                        'tokens_used': result['tokens_used']
                    }
            except json.JSONDecodeError as e:
                return {
                    'success': False,
                    'error': f'Failed to parse analysis: {str(e)}',
                    'raw_content': result['content']
                }
        
        return result
    
    def generate_prd(self, project_name: str, requirements: List[Dict], analysis: Dict) -> Dict:
        """
        Generate Product Requirements Document
        
        Args:
            project_name: Name of the project
            requirements: List of requirements
            analysis: Analysis results from analyze_requirements
        
        Returns:
            Generated PRD document
        """
        requirements_text = "\n".join([
            f"- {req['question']}: {req['answer']}"
            for req in requirements
        ])
        
        prompt = f"""
Create a comprehensive Product Requirements Document (PRD) for the following project:

Project Name: {project_name}

Requirements:
{requirements_text}

Technical Analysis:
{json.dumps(analysis, indent=2)}

Generate a detailed PRD with the following sections:
1. Executive Summary
2. Technical Requirements
3. Feature Specifications (with user stories)
4. Development Plan (phases and tasks)
5. Timeline & Milestones

Format the output in Markdown.
"""
        
        result = self.generate_code(
            prompt=prompt,
            model='gpt-4',
            temperature=0.5,
            max_tokens=3000
        )
        
        return result
    
    def generate_task_breakdown(self, prd_content: str, agent_roles: List[str]) -> Dict:
        """
        Break down PRD into specific tasks for agents
        
        Args:
            prd_content: PRD document content
            agent_roles: List of available agent roles
        
        Returns:
            Task breakdown with assignments
        """
        prompt = f"""
Based on the following PRD, create a detailed task breakdown for the development team.

Available Team Roles:
{', '.join(agent_roles)}

PRD:
{prd_content}

Generate a task list in JSON format:
{{
    "tasks": [
        {{
            "title": "Task title",
            "description": "Detailed description",
            "assigned_role": "role_name",
            "priority": "high|medium|low",
            "estimated_hours": 8,
            "dependencies": ["task_id1", "task_id2"],
            "deliverables": ["deliverable1", "deliverable2"]
        }}
    ]
}}

Ensure tasks are:
1. Specific and actionable
2. Properly sequenced with dependencies
3. Assigned to appropriate roles
4. Include clear deliverables
"""
        
        result = self.generate_code(
            prompt=prompt,
            model='gpt-4',
            temperature=0.3,
            max_tokens=2500
        )
        
        if result['success']:
            try:
                content = result['content']
                start = content.find('{')
                end = content.rfind('}') + 1
                if start != -1 and end > start:
                    json_str = content[start:end]
                    tasks = json.loads(json_str)
                    return {
                        'success': True,
                        'tasks': tasks,
                        'tokens_used': result['tokens_used']
                    }
            except json.JSONDecodeError as e:
                return {
                    'success': False,
                    'error': f'Failed to parse tasks: {str(e)}',
                    'raw_content': result['content']
                }
        
        return result
    
    def execute_task(
        self,
        task_description: str,
        role: str,
        context: Dict,
        model: str = 'gpt-4-turbo'
    ) -> Dict:
        """
        Execute a specific task using OpenCode
        
        Args:
            task_description: Description of the task
            role: Agent role executing the task
            context: Context information (project, previous work, etc.)
            model: Model to use
        
        Returns:
            Task execution result
        """
        prompt = f"""
Role: {role}

Task: {task_description}

Context:
- Project: {context.get('project_name', 'N/A')}
- Requirements: {context.get('requirements', 'N/A')}
- Previous Work: {context.get('previous_work', 'None')}

Instructions:
{context.get('instructions', 'Complete the task according to best practices.')}

Provide your output in a structured format with:
1. Implementation details
2. Code/design artifacts
3. Testing considerations
4. Next steps
"""
        
        result = self.generate_code(
            prompt=prompt,
            model=model,
            temperature=0.7,
            max_tokens=3000
        )
        
        return result


# Singleton instance
_client_instance = None

def get_opencode_client(api_key: Optional[str] = None) -> OpenCodeClient:
    """Get or create OpenCode client instance"""
    global _client_instance
    if _client_instance is None or api_key:
        _client_instance = OpenCodeClient(api_key)
    return _client_instance

# Made with Bob
