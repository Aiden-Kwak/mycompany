"""
Planning Services
Orchestrates the planning document generation process
"""
from typing import Dict, List
from projects.models import Project, ProjectRequirement
from .models import PlanningDocument, AgentRecommendation
from opencode.client import get_opencode_client


class PlanningService:
    """Service for generating planning documents"""
    
    def __init__(self, project: Project):
        self.project = project
        self.client = get_opencode_client()
    
    def generate_full_plan(self) -> PlanningDocument:
        """
        Generate complete planning document from project requirements
        
        Steps:
        1. Analyze requirements
        2. Generate PRD
        3. Create agent recommendations
        4. Save everything to database
        """
        # Step 1: Get requirements
        requirements = list(
            self.project.requirements.values(
                'category', 'question', 'answer', 'priority'
            )
        )
        
        if not requirements:
            raise ValueError("Project has no requirements")
        
        # Step 2: Analyze requirements
        print(f"📊 Analyzing requirements for {self.project.name}...")
        analysis_result = self.client.analyze_requirements(requirements)
        
        if not analysis_result.get('success'):
            raise Exception(f"Failed to analyze requirements: {analysis_result.get('error')}")
        
        analysis = analysis_result['analysis']
        tokens_used = analysis_result.get('tokens_used', 0)
        
        # Step 3: Generate PRD
        print(f"📝 Generating PRD...")
        prd_result = self.client.generate_prd(
            project_name=self.project.name,
            requirements=requirements,
            analysis=analysis
        )
        
        if not prd_result.get('success'):
            raise Exception(f"Failed to generate PRD: {prd_result.get('error')}")
        
        prd_content = prd_result['content']
        tokens_used += prd_result.get('tokens_used', 0)
        
        # Step 4: Parse PRD sections
        sections = self._parse_prd_sections(prd_content)
        
        # Step 5: Create or update planning document
        planning_doc, created = PlanningDocument.objects.update_or_create(
            project=self.project,
            defaults={
                'tech_stack': analysis.get('tech_stack', {}),
                'required_roles': analysis.get('required_roles', []),
                'complexity': analysis.get('complexity', 'medium'),
                'key_features': analysis.get('key_features', []),
                'challenges': analysis.get('challenges', []),
                'executive_summary': sections.get('executive_summary', ''),
                'technical_requirements': sections.get('technical_requirements', ''),
                'feature_specifications': sections.get('feature_specifications', ''),
                'development_plan': sections.get('development_plan', ''),
                'timeline': sections.get('timeline', ''),
                'full_document': prd_content,
                'tokens_used': tokens_used,
            }
        )
        
        # Step 6: Create agent recommendations
        self._create_agent_recommendations(planning_doc, analysis)
        
        print(f"✅ Planning document generated successfully!")
        print(f"   Tokens used: {tokens_used}")
        print(f"   Complexity: {analysis.get('complexity')}")
        print(f"   Required roles: {len(analysis.get('required_roles', []))}")
        
        return planning_doc
    
    def _parse_prd_sections(self, prd_content: str) -> Dict[str, str]:
        """Parse PRD content into sections"""
        sections = {
            'executive_summary': '',
            'technical_requirements': '',
            'feature_specifications': '',
            'development_plan': '',
            'timeline': '',
        }
        
        # Simple section parsing based on headers
        current_section = None
        current_content = []
        
        for line in prd_content.split('\n'):
            line_lower = line.lower().strip()
            
            # Check for section headers
            if 'executive summary' in line_lower or '## 1.' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'executive_summary'
                current_content = []
            elif 'technical requirement' in line_lower or '## 2.' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'technical_requirements'
                current_content = []
            elif 'feature specification' in line_lower or '## 3.' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'feature_specifications'
                current_content = []
            elif 'development plan' in line_lower or '## 4.' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'development_plan'
                current_content = []
            elif 'timeline' in line_lower or 'milestone' in line_lower or '## 5.' in line:
                if current_section and current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'timeline'
                current_content = []
            elif current_section:
                current_content.append(line)
        
        # Save last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections
    
    def _create_agent_recommendations(
        self,
        planning_doc: PlanningDocument,
        analysis: Dict
    ):
        """Create agent recommendations from analysis"""
        # Clear existing recommendations
        planning_doc.agent_recommendations.all().delete()
        
        required_roles = analysis.get('required_roles', [])
        
        for role_info in required_roles:
            if isinstance(role_info, dict):
                role = role_info.get('role', '')
                reason = role_info.get('reason', '')
            else:
                role = str(role_info)
                reason = 'Required for project development'
            
            # Determine priority based on role
            priority = 'high'
            if 'optional' in reason.lower() or 'nice to have' in reason.lower():
                priority = 'low'
            elif 'important' in reason.lower():
                priority = 'medium'
            
            # Estimate workload based on complexity
            complexity = planning_doc.complexity
            base_hours = {'low': 20, 'medium': 40, 'high': 80}
            estimated_workload = base_hours.get(complexity, 40)
            
            AgentRecommendation.objects.create(
                planning_document=planning_doc,
                role=role,
                reason=reason,
                priority=priority,
                estimated_workload=estimated_workload
            )


class AgentAutoCreator:
    """Service for automatically creating agents based on planning document"""
    
    ROLE_MAPPING = {
        'product_manager': {
            'name': 'Product Manager',
            'avatar': '📋',
            'department': 'development',
            'skills': ['requirement_analysis', 'feature_planning', 'user_story'],
        },
        'ui_ux_designer': {
            'name': 'UI/UX Designer',
            'avatar': '🎨',
            'department': 'design',
            'skills': ['ui_design', 'ux_flow', 'wireframe', 'prototyping'],
        },
        'frontend_developer': {
            'name': 'Frontend Developer',
            'avatar': '💻',
            'department': 'development',
            'skills': ['react', 'typescript', 'css', 'api_integration'],
        },
        'backend_developer': {
            'name': 'Backend Developer',
            'avatar': '⚙️',
            'department': 'development',
            'skills': ['python', 'django', 'api', 'database', 'security'],
        },
        'qa_engineer': {
            'name': 'QA Engineer',
            'avatar': '🔍',
            'department': 'development',
            'skills': ['testing', 'debugging', 'code_review', 'automation'],
        },
        'devops_engineer': {
            'name': 'DevOps Engineer',
            'avatar': '🚀',
            'department': 'development',
            'skills': ['deployment', 'ci_cd', 'docker', 'monitoring'],
        },
        'data_analyst': {
            'name': 'Data Analyst',
            'avatar': '📊',
            'department': 'development',
            'skills': ['data_analysis', 'sql', 'visualization', 'reporting'],
        },
    }
    
    def __init__(self, planning_document: PlanningDocument):
        self.planning_doc = planning_document
        self.project = planning_document.project
    
    def create_agents(self) -> List:
        """Create agents based on recommendations"""
        from agents.models import Agent
        
        recommendations = self.planning_doc.agent_recommendations.all()
        created_agents = []
        
        for rec in recommendations:
            # Normalize role name
            role_key = rec.role.lower().replace(' ', '_').replace('-', '_')
            
            # Get role template
            role_template = self.ROLE_MAPPING.get(role_key)
            if not role_template:
                # Try to find closest match
                for key, template in self.ROLE_MAPPING.items():
                    if key in role_key or role_key in key:
                        role_template = template
                        role_key = key
                        break
            
            if not role_template:
                print(f"⚠️  No template found for role: {rec.role}, skipping...")
                continue
            
            # Check if agent already exists
            existing = Agent.objects.filter(
                project=self.project,
                role=role_key
            ).first()
            
            if existing:
                print(f"ℹ️  Agent {role_template['name']} already exists, skipping...")
                continue
            
            # Create agent
            agent = Agent.objects.create(
                project=self.project,
                name=role_template['name'],
                role=role_key,
                department=role_template['department'],
                avatar=role_template['avatar'],
                skills=role_template['skills'],
                status='idle'
            )
            
            created_agents.append(agent)
            print(f"✅ Created agent: {agent.name} ({agent.avatar})")
        
        return created_agents


def generate_project_plan(project_id: int) -> Dict:
    """
    Main entry point for generating project plan
    
    Args:
        project_id: Project ID
    
    Returns:
        Dictionary with planning document and created agents
    """
    try:
        project = Project.objects.get(id=project_id)
        
        # Generate planning document
        service = PlanningService(project)
        planning_doc = service.generate_full_plan()
        
        # Auto-create agents
        creator = AgentAutoCreator(planning_doc)
        agents = creator.create_agents()
        
        # Update project status
        project.status = 'in_progress'
        project.save()
        
        return {
            'success': True,
            'planning_document': planning_doc,
            'agents_created': len(agents),
            'agents': agents,
        }
    
    except Project.DoesNotExist:
        return {
            'success': False,
            'error': 'Project not found'
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

# Made with Bob
