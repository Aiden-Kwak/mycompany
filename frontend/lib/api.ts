import { Project, Agent, Task } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private getCSRFToken(): string | null {
    // Get CSRF token from cookie
    const name = 'csrftoken';
    let cookieValue: string | null = null;
    if (typeof document !== 'undefined' && document.cookie) {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add CSRF token for non-GET requests
    const csrfToken = this.getCSRFToken();
    if (csrfToken && options.method && options.method !== 'GET') {
      headers['X-CSRFToken'] = csrfToken;
    }
    
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Include cookies for session authentication
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Project endpoints
  async getProjects(): Promise<Project[]> {
    return this.request<Project[]>('/projects/');
  }

  async getProject(id: string): Promise<Project> {
    return this.request<Project>(`/projects/${id}/`);
  }

  async getDashboardStats(): Promise<{
    stats: {
      totalAgents: number;
      activeTasks: number;
      completionRate: number;
      githubRepos: number;
    };
    departments: Array<{
      id: string;
      name: string;
      icon: string;
      color: string;
      bgColor: string;
      agents: number;
      tasks: number;
      progress: number;
    }>;
  }> {
    return this.request('/projects/stats/');
  }

  async createProject(data: {
    name: string;
    description: string;
    github_repo?: string;
    requirements?: Array<{
      category: string;
      question: string;
      answer: string;
      priority?: 'high' | 'medium' | 'low';
    }>;
  }): Promise<Project> {
    return this.request<Project>('/projects/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    return this.request<Project>(`/projects/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(id: string): Promise<void> {
    return this.request<void>(`/projects/${id}/`, {
      method: 'DELETE',
    });
  }

  async getProjectRequirements(projectId: string) {
    return this.request(`/projects/${projectId}/requirements/`);
  }

  async getProjectStats(projectId: string): Promise<{
    total_agents: number;
    active_agents: number;
    total_tasks: number;
    completed_tasks: number;
    in_progress_tasks: number;
    completion_rate: number;
  }> {
    return this.request(`/projects/${projectId}/stats/`);
  }

  // Agent endpoints
  async getAgents(projectId?: string): Promise<Agent[]> {
    const endpoint = projectId ? `/agents/?project=${projectId}` : '/agents/';
    return this.request<Agent[]>(endpoint);
  }

  async getAgent(id: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}/`);
  }

  async createAgent(data: {
    project: string;
    name: string;
    role: string;
    department: string;
    avatar?: string;
    skills?: string[];
  }): Promise<Agent> {
    return this.request<Agent>('/agents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAgent(id: string, data: Partial<Agent>): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateAgentStatus(id: string, status: 'idle' | 'working' | 'completed' | 'error'): Promise<Agent> {
    return this.request<Agent>(`/agents/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  async getAgentTasks(agentId: string): Promise<Task[]> {
    return this.request<Task[]>(`/agents/${agentId}/tasks/`);
  }

  // Task endpoints
  async getTasks(projectId?: string, agentId?: string): Promise<Task[]> {
    let endpoint = '/tasks/';
    const params = new URLSearchParams();
    if (projectId) params.append('project', projectId);
    if (agentId) params.append('agent', agentId);
    if (params.toString()) endpoint += `?${params.toString()}`;
    return this.request<Task[]>(endpoint);
  }

  async getTask(id: string): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/`);
  }

  async createTask(data: {
    project: string;
    assigned_to?: string;
    title: string;
    description: string;
    priority?: 'high' | 'medium' | 'low';
    dependencies?: string[];
  }): Promise<Task> {
    return this.request<Task>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateTaskProgress(id: string, progress: number): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/update_progress/`, {
      method: 'POST',
      body: JSON.stringify({ progress }),
    });
  }

  async updateTaskStatus(
    id: string,
    status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'failed'
  ): Promise<Task> {
    return this.request<Task>(`/tasks/${id}/update_status/`, {
      method: 'POST',
      body: JSON.stringify({ status }),
    });
  }

  // GitHub endpoints
  async getGitHubAccounts(): Promise<any[]> {
    return this.request<any[]>('/github/accounts/');
  }

  async getGitHubRepositories(): Promise<any[]> {
    return this.request<any[]>('/github/repositories/');
  }

  async createGitHubRepository(data: {
    project_id: number;
    name: string;
    description?: string;
    private?: boolean;
    auto_init?: boolean;
  }): Promise<any> {
    return this.request<any>('/github/repositories/create_repository/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async commitFileToGitHub(repositoryId: string, data: {
    file_path: string;
    content: string;
    commit_message: string;
    branch?: string;
  }): Promise<any> {
    return this.request<any>(`/github/repositories/${repositoryId}/commit_file/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getRepositoryCommits(repositoryId: string): Promise<any[]> {
    return this.request<any[]>(`/github/repositories/${repositoryId}/commits/`);
  }

  // AI Service API Key endpoints
  async getAIServices(): Promise<any[]> {
    return this.request<any[]>('/api-keys/services/');
  }

  async getAPIKeys(): Promise<any[]> {
    return this.request<any[]>('/api-keys/');
  }

  async getActiveAPIKeys(): Promise<any[]> {
    return this.request<any[]>('/api-keys/active/');
  }

  async createAPIKey(data: {
    service_type: string;
    api_key: string;
  }): Promise<any> {
    return this.request<any>('/api-keys/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAPIKey(id: string, data: {
    api_key?: string;
    is_active?: boolean;
  }): Promise<any> {
    return this.request<any>(`/api-keys/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAPIKey(id: string): Promise<void> {
    return this.request<void>(`/api-keys/${id}/`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

// Made with Bob
