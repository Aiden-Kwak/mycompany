import { Project, Agent, Task } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
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

  // Agent endpoints (to be implemented in backend)
  async getAgents(projectId?: string): Promise<Agent[]> {
    const endpoint = projectId ? `/agents/?project=${projectId}` : '/agents/';
    return this.request<Agent[]>(endpoint);
  }

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    return this.request<Agent>('/agents/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Task endpoints (to be implemented in backend)
  async getTasks(projectId?: string): Promise<Task[]> {
    const endpoint = projectId ? `/tasks/?project=${projectId}` : '/tasks/';
    return this.request<Task[]>(endpoint);
  }

  async createTask(data: Partial<Task>): Promise<Task> {
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
}

// Export singleton instance
export const api = new ApiClient();

// Export class for testing or custom instances
export default ApiClient;

// Made with Bob
