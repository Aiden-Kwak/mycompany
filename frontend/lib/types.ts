// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
  created_by: number;
  github_repo?: string;
  requirements?: ProjectRequirement[];
  agents?: Agent[];
  agent_count?: number;
  task_count?: number;
}

export interface ProjectRequirement {
  id: string;
  category: string;
  question: string;
  answer: string;
  priority: 'high' | 'medium' | 'low';
}

// Agent Types
export interface Agent {
  id: string;
  name: string;
  role: AgentRole;
  department: Department;
  status: AgentStatus;
  avatar: string;
  currentTask?: Task;
  completedTasks: Task[];
  skills: string[];
}

export type AgentRole = 
  | 'Product Manager'
  | 'UI/UX Designer'
  | 'Frontend Developer'
  | 'Backend Developer'
  | 'QA Engineer'
  | 'DevOps Engineer'
  | 'Data Analyst';

export type AgentStatus = 'idle' | 'working' | 'completed' | 'error';

export type Department = 
  | 'Development'
  | 'Design'
  | 'Marketing'
  | 'Sales'
  | 'HR'
  | 'Finance'
  | 'Support';

// Task Types
export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: 'high' | 'medium' | 'low';
  assignedTo: string; // Agent ID
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  output?: TaskOutput;
  dependencies: string[]; // Task IDs
  progress: number;
}

export type TaskStatus = 
  | 'pending'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'blocked'
  | 'failed';

export interface TaskOutput {
  type: 'code' | 'design' | 'document' | 'analysis';
  content: string;
  files?: OutputFile[];
  metadata?: Record<string, any>;
}

export interface OutputFile {
  name: string;
  path: string;
  content: string;
  language?: string;
}

// Survey Types
export interface SurveyQuestion {
  id: string;
  category: string;
  question: string;
  type: 'text' | 'select' | 'multiselect' | 'checkbox' | 'textarea';
  options?: string[];
  required: boolean;
  placeholder?: string;
  helpText?: string;
}

export interface SurveyAnswer {
  questionId: string;
  answer: string | string[];
}

// GitHub Types
export interface GitHubAccount {
  id: string;
  user_id: number;
  username: string;
  email?: string;
  avatar_url?: string;
  access_token: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepository {
  id: string;
  project: string;
  github_account: string;
  repo_name: string;
  repo_full_name: string;
  repo_url: string;
  default_branch: string;
  is_private: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface GitHubCommit {
  id: string;
  repository: string;
  sha: string;
  message: string;
  author_name: string;
  author_email: string;
  committed_at: string;
  url: string;
  created_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  fullName: string;
  description: string;
  url: string;
  private: boolean;
  defaultBranch: string;
}

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string;
  avatarUrl: string;
  accessToken: string;
}

// Dashboard Types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalAgents: number;
  activeAgents: number;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export interface DepartmentStats {
  department: Department;
  agentCount: number;
  activeTasks: number;
  completedTasks: number;
  progress: number;
}

// Made with Bob
