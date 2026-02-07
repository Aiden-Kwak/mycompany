# OpenCode Integration & Automation Guide

## 🎯 Overview

This guide explains how to use the OpenCode integration and automation system to automatically generate planning documents, create agents, and execute tasks in parallel.

## 📋 Prerequisites

1. **OpenCode API Key**: Get your API key from OpenCode
2. **Virtual Environment**: Activate your Python virtual environment
3. **Database**: PostgreSQL running
4. **Redis**: Redis server running (for Celery)

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

Required packages:
- `requests` - For OpenCode API calls
- `celery` - For parallel task execution
- `python-dotenv` - For environment variables

### 2. Configure Environment Variables

Edit `backend/.env`:

```env
# OpenCode API
OPENCODE_API_KEY=your-opencode-api-key-here
OPENCODE_API_URL=https://api.opencode.com/v1

# API Key Encryption
API_KEY_ENCRYPTION_KEY=your-fernet-encryption-key

# Celery (for parallel execution)
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
```

Generate encryption key:
```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

### 3. Run Database Migrations

```bash
cd backend
python3 manage.py makemigrations planning
python3 manage.py migrate
```

### 4. Start Services

Terminal 1 - Django:
```bash
cd backend
python3 manage.py runserver
```

Terminal 2 - Celery Worker (for parallel execution):
```bash
cd backend
celery -A config worker -l info
```

Terminal 3 - Redis:
```bash
redis-server
```

## 🔄 Complete Automation Workflow

### Step 1: Create Project with Requirements

```bash
# Via API
curl -X POST "http://localhost:8000/api/projects/" \
  -H "Cookie: sessionid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN" \
  -d '{
    "name": "E-commerce Platform",
    "description": "Online shopping platform with cart and payment",
    "requirements": [
      {
        "category": "Basic Info",
        "question": "What type of application?",
        "answer": "E-commerce web application",
        "priority": "high"
      },
      {
        "category": "Features",
        "question": "What are the main features?",
        "answer": "Product catalog, shopping cart, user authentication, payment processing",
        "priority": "high"
      },
      {
        "category": "Technical",
        "question": "Preferred tech stack?",
        "answer": "React frontend, Django backend, PostgreSQL database",
        "priority": "high"
      }
    ]
  }'
```

### Step 2: Generate Planning Document

This will:
- Analyze requirements using OpenCode
- Generate comprehensive PRD
- Recommend required agents
- Auto-create agents

```bash
curl -X POST "http://localhost:8000/api/planning/generate/" \
  -H "Cookie: sessionid=YOUR_SESSION_ID" \
  -H "Content-Type: application/json" \
  -H "X-CSRFToken: YOUR_CSRF_TOKEN" \
  -d '{
    "project_id": 1
  }'
```

Response:
```json
{
  "message": "Planning document generated successfully",
  "planning_document": {
    "id": 1,
    "project": 1,
    "complexity": "high",
    "tech_stack": {
      "frontend": ["React", "TypeScript", "Tailwind CSS"],
      "backend": ["Django", "Django REST Framework"],
      "database": "PostgreSQL",
      "other": ["Redis", "Celery"]
    },
    "required_roles": [
      {"role": "product_manager", "reason": "Define features and requirements"},
      {"role": "ui_ux_designer", "reason": "Design user interface"},
      {"role": "frontend_developer", "reason": "Implement React components"},
      {"role": "backend_developer", "reason": "Build API and business logic"},
      {"role": "qa_engineer", "reason": "Test and ensure quality"}
    ],
    "key_features": [
      "Product catalog with search and filters",
      "Shopping cart management",
      "User authentication and profiles",
      "Payment processing integration",
      "Order management"
    ],
    "full_document": "# Product Requirements Document\n\n## 1. Executive Summary...",
    "agent_recommendations": [...]
  },
  "agents_created": 5
}
```

### Step 3: View Generated Planning Document

```bash
curl -X GET "http://localhost:8000/api/planning/by-project/1/" \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

### Step 4: View Auto-Created Agents

```bash
curl -X GET "http://localhost:8000/api/agents/?project=1" \
  -H "Cookie: sessionid=YOUR_SESSION_ID"
```

Response:
```json
[
  {
    "id": 1,
    "name": "Product Manager",
    "role": "product_manager",
    "avatar": "📋",
    "department": "development",
    "skills": ["requirement_analysis", "feature_planning", "user_story"],
    "status": "idle"
  },
  {
    "id": 2,
    "name": "UI/UX Designer",
    "role": "ui_ux_designer",
    "avatar": "🎨",
    "department": "design",
    "skills": ["ui_design", "ux_flow", "wireframe", "prototyping"],
    "status": "idle"
  },
  ...
]
```

## 🎨 Frontend Integration

### 1. Add Planning Document Generation Button

```typescript
// In project detail page
const generatePlan = async () => {
  setLoading(true);
  try {
    const response = await fetch(`${API_URL}/api/planning/generate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCsrfToken(),
      },
      credentials: 'include',
      body: JSON.stringify({ project_id: projectId }),
    });
    
    const data = await response.json();
    
    if (response.ok) {
      toast.success(`Planning document generated! ${data.agents_created} agents created.`);
      // Refresh agents list
      loadAgents();
    } else {
      toast.error(data.error || 'Failed to generate plan');
    }
  } catch (error) {
    toast.error('Network error');
  } finally {
    setLoading(false);
  }
};
```

### 2. Display Planning Document

```typescript
const [planningDoc, setPlanningDoc] = useState(null);

useEffect(() => {
  const loadPlanningDoc = async () => {
    const response = await fetch(
      `${API_URL}/api/planning/by-project/${projectId}/`,
      { credentials: 'include' }
    );
    
    if (response.ok) {
      const data = await response.json();
      setPlanningDoc(data);
    }
  };
  
  loadPlanningDoc();
}, [projectId]);

// Render
{planningDoc && (
  <div className="planning-document">
    <h2>📋 Planning Document</h2>
    <div className="complexity">
      Complexity: <span className={planningDoc.complexity}>
        {planningDoc.complexity}
      </span>
    </div>
    
    <div className="tech-stack">
      <h3>Tech Stack</h3>
      <ul>
        <li>Frontend: {planningDoc.tech_stack.frontend.join(', ')}</li>
        <li>Backend: {planningDoc.tech_stack.backend.join(', ')}</li>
        <li>Database: {planningDoc.tech_stack.database}</li>
      </ul>
    </div>
    
    <div className="features">
      <h3>Key Features</h3>
      <ul>
        {planningDoc.key_features.map((feature, i) => (
          <li key={i}>{feature}</li>
        ))}
      </ul>
    </div>
    
    <div className="full-document">
      <ReactMarkdown>{planningDoc.full_document}</ReactMarkdown>
    </div>
  </div>
)}
```

## 🔧 API Endpoints

### Planning Document APIs

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/planning/generate/` | Generate planning document for a project |
| GET | `/api/planning/by-project/{id}/` | Get planning document for a project |
| GET | `/api/planning/{id}/` | Get specific planning document |
| GET | `/api/planning/` | List all planning documents |

### Request/Response Examples

#### Generate Planning Document

**Request:**
```json
POST /api/planning/generate/
{
  "project_id": 1
}
```

**Response:**
```json
{
  "message": "Planning document generated successfully",
  "planning_document": { ... },
  "agents_created": 5
}
```

## 🎯 What Happens Automatically

### 1. Requirement Analysis (OpenCode)
- Analyzes survey responses
- Identifies technical requirements
- Recommends tech stack
- Determines project complexity
- Identifies potential challenges

### 2. PRD Generation (OpenCode)
- Creates comprehensive Product Requirements Document
- Includes:
  - Executive Summary
  - Technical Requirements
  - Feature Specifications with user stories
  - Development Plan
  - Timeline & Milestones

### 3. Agent Auto-Creation
- Analyzes PRD to determine required roles
- Creates agents with appropriate:
  - Role and department
  - Skills and capabilities
  - Avatar emoji
  - Initial status (idle)

### 4. Agent Role Mapping

| Role | Avatar | Skills | Department |
|------|--------|--------|------------|
| Product Manager | 📋 | requirement_analysis, feature_planning, user_story | development |
| UI/UX Designer | 🎨 | ui_design, ux_flow, wireframe, prototyping | design |
| Frontend Developer | 💻 | react, typescript, css, api_integration | development |
| Backend Developer | ⚙️ | python, django, api, database, security | development |
| QA Engineer | 🔍 | testing, debugging, code_review, automation | development |
| DevOps Engineer | 🚀 | deployment, ci_cd, docker, monitoring | development |
| Data Analyst | 📊 | data_analysis, sql, visualization, reporting | development |

## 📊 Monitoring & Debugging

### Check OpenCode Connection

```python
from opencode.client import get_opencode_client

client = get_opencode_client()
result = client.test_connection()
print(result)
# {'success': True, 'message': 'Connection successful', 'models': [...]}
```

### View Planning Document in Admin

1. Go to `http://localhost:8000/admin/`
2. Navigate to Planning → Planning documents
3. View generated documents, analysis, and recommendations

### Check Celery Tasks

```bash
# View active tasks
celery -A config inspect active

# View registered tasks
celery -A config inspect registered
```

## 🚨 Troubleshooting

### Issue: "OpenCode API key not configured"

**Solution:**
```bash
# Add to backend/.env
OPENCODE_API_KEY=your-key-here
```

### Issue: "Failed to analyze requirements"

**Possible causes:**
1. Invalid API key
2. Network connectivity issues
3. OpenCode API rate limits
4. Insufficient project requirements

**Solution:**
- Verify API key is correct
- Check network connection
- Ensure project has at least 3 requirements
- Check OpenCode API status

### Issue: "No agents created"

**Possible causes:**
1. Planning document generation failed
2. Role mapping not found
3. Agents already exist

**Solution:**
- Check planning document was created successfully
- Verify agent recommendations in planning document
- Check if agents already exist for the project

## 📈 Next Steps

After planning document and agents are created:

1. **Task Generation** (Coming soon)
   - Break down PRD into specific tasks
   - Assign tasks to agents
   - Set up dependencies

2. **Parallel Execution** (Coming soon)
   - Execute tasks in parallel using Celery
   - Stream progress updates via WebSocket
   - Handle task dependencies

3. **Code Generation** (Coming soon)
   - Use OpenCode to generate code for each task
   - Commit to GitHub automatically
   - Run tests and quality checks

## 🎓 Best Practices

1. **Detailed Requirements**: Provide comprehensive survey answers for better analysis
2. **Review PRD**: Always review the generated PRD before proceeding
3. **Customize Agents**: Adjust agent skills and roles as needed
4. **Monitor Tokens**: Keep track of OpenCode API token usage
5. **Incremental Development**: Start with core features, add more later

## 📚 Additional Resources

- [OpenCode API Documentation](https://docs.opencode.com)
- [OPENCODE_AUTOMATION_PLAN.md](./OPENCODE_AUTOMATION_PLAN.md) - Detailed architecture
- [API_TESTING_RESULTS.md](./API_TESTING_RESULTS.md) - API test results
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture

---

**Made with ❤️ and 🤖 by the My Dev Company Team**