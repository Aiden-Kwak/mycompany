'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Project, Agent, Task, GitHubRepository } from '@/lib/types';
import PixelCard from '@/components/pixel/PixelCard';
import PixelButton from '@/components/pixel/PixelButton';
import AgentCard from '@/components/agents/AgentCard';
import AgentCreateModal from '@/components/agents/AgentCreateModal';
import TaskBoard from '@/components/tasks/TaskBoard';
import TaskCreateModal from '@/components/tasks/TaskCreateModal';
import GitHubConnectModal from '@/components/github/GitHubConnectModal';
import GitHubRepoCard from '@/components/github/GitHubRepoCard';
import APIKeyManagementModal from '@/components/settings/APIKeyManagementModal';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const [projectData, statsData, agentsData, tasksData, reposData] = await Promise.all([
        api.getProject(projectId),
        api.getProjectStats(projectId),
        api.getAgents(projectId),
        api.getTasks(projectId),
        api.getGitHubRepositories().catch(() => []),
      ]);
      setProject(projectData);
      setStats(statsData);
      setAgents(agentsData);
      setTasks(tasksData);
      // Filter repositories for this project
      setRepositories(reposData.filter((repo: GitHubRepository) => repo.project === projectId));
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleAgentCreated = () => {
    setShowAgentModal(false);
    loadProject(); // Reload to get updated data
  };

  const handleTaskCreated = () => {
    setShowTaskModal(false);
    loadProject(); // Reload to get updated data
  };

  const handleGitHubConnected = (repository: GitHubRepository) => {
    setShowGitHubModal(false);
    loadProject(); // Reload to get updated data
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🚀</div>
          <p className="text-xl font-semibold text-slate-700">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <PixelCard className="p-8 max-w-md">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Error</h2>
            <p className="text-slate-600 mb-6">{error || 'Project not found'}</p>
            <PixelButton onClick={() => router.push('/')}>
              Go Home
            </PixelButton>
          </div>
        </PixelCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/')}
                className="text-slate-600 hover:text-slate-900 transition-colors"
              >
                ← Back
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
                <p className="text-sm text-slate-600">{project.description}</p>
              </div>
            </div>
            <span className={`badge ${
              project.status === 'completed' ? 'badge-success' :
              project.status === 'in_progress' ? 'badge-primary' :
              project.status === 'failed' ? 'badge-danger' :
              'bg-slate-100 text-slate-700 border-slate-200'
            }`}>
              {project.status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Grid */}
        {stats && (
          <section className="animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Project Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="stat-card card-hover">
                <div className="stat-label">Total Agents</div>
                <div className="stat-value">{stats.total_agents}</div>
                <div className="text-sm text-success-600 mt-1">
                  {stats.active_agents} active
                </div>
              </div>
              <div className="stat-card card-hover">
                <div className="stat-label">Total Tasks</div>
                <div className="stat-value">{stats.total_tasks}</div>
                <div className="text-sm text-primary-600 mt-1">
                  {stats.in_progress_tasks} in progress
                </div>
              </div>
              <div className="stat-card card-hover">
                <div className="stat-label">Completed</div>
                <div className="stat-value">{stats.completed_tasks}</div>
              </div>
              <div className="stat-card card-hover">
                <div className="stat-label">Completion Rate</div>
                <div className="stat-value">{stats.completion_rate}%</div>
              </div>
            </div>
          </section>
        )}

        {/* Requirements */}
        {project.requirements && project.requirements.length > 0 && (
          <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Requirements</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.requirements.map((req, index) => (
                <PixelCard key={req.id} className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <span className="badge badge-primary">{req.category}</span>
                    <span className={`badge ${
                      req.priority === 'high' ? 'badge-danger' :
                      req.priority === 'medium' ? 'badge-warning' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {req.priority}
                    </span>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{req.question}</h3>
                  <p className="text-sm text-slate-600">{req.answer}</p>
                </PixelCard>
              ))}
            </div>
          </section>
        )}

        {/* Agents Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">AI Agents</h2>
            <PixelButton
              variant="primary"
              size="sm"
              onClick={() => setShowAgentModal(true)}
            >
              + Add Agent
            </PixelButton>
          </div>
          
          {agents.length === 0 ? (
            <PixelCard className="p-12 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No agents yet
              </h3>
              <p className="text-slate-600 mb-6">
                Add AI agents to start working on your project
              </p>
              <PixelButton
                variant="primary"
                onClick={() => setShowAgentModal(true)}
              >
                Create First Agent
              </PixelButton>
            </PixelCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <AgentCard
                  key={agent.id}
                  name={agent.name}
                  role={agent.role}
                  status={agent.status}
                  avatar={agent.avatar}
                  progress={0}
                />
              ))}
            </div>
          )}
        </section>

        {/* Tasks Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">Tasks</h2>
            <div className="flex items-center space-x-3">
              {/* View Toggle */}
              <div className="flex items-center space-x-2 bg-white rounded-lg p-1 border border-slate-200">
                <button
                  onClick={() => setViewMode('board')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'board'
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 Board
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📝 List
                </button>
              </div>
              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => setShowTaskModal(true)}
              >
                + Add Task
              </PixelButton>
            </div>
          </div>

          {tasks.length === 0 ? (
            <PixelCard className="p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No tasks yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create tasks to organize your project work
              </p>
              <PixelButton
                variant="primary"
                onClick={() => setShowTaskModal(true)}
              >
                Create First Task
              </PixelButton>
            </PixelCard>
          ) : viewMode === 'board' ? (
            <TaskBoard
              projectId={projectId}
              tasks={tasks}
              onTaskUpdate={loadProject}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks.map((task) => (
                <div key={task.id}>
                  {/* Task list view - simplified for now */}
                  <PixelCard className="p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-600">{task.description}</p>
                  </PixelCard>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* GitHub Integration Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">GitHub Integration</h2>
            {repositories.length === 0 && (
              <PixelButton
                variant="primary"
                size="sm"
                onClick={() => setShowGitHubModal(true)}
              >
                🔗 Connect GitHub
              </PixelButton>
            )}
          </div>

          {repositories.length === 0 ? (
            <PixelCard className="p-12 text-center">
              <div className="text-6xl mb-4">🔗</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No GitHub repository connected
              </h3>
              <p className="text-slate-600 mb-6">
                Connect your GitHub account to automatically manage your project repository
              </p>
              <PixelButton
                variant="primary"
                onClick={() => setShowGitHubModal(true)}
              >
                Connect GitHub Repository
              </PixelButton>
            </PixelCard>
          ) : (
            <div className="space-y-4">
              {repositories.map((repo) => (
                <GitHubRepoCard key={repo.id} repository={repo} />
              ))}
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <PixelCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <PixelButton variant="primary">
                🚀 Start Development
              </PixelButton>
              <PixelButton
                variant="secondary"
                onClick={() => setShowAPIKeyModal(true)}
              >
                🔑 Manage API Keys
              </PixelButton>
              <PixelButton variant="secondary">
                📊 View Analytics
              </PixelButton>
              <PixelButton variant="secondary">
                ⚙️ Project Settings
              </PixelButton>
              {repositories.length === 0 && (
                <PixelButton
                  variant="secondary"
                  onClick={() => setShowGitHubModal(true)}
                >
                  🔗 Connect GitHub
                </PixelButton>
              )}
            </div>
          </PixelCard>
        </section>
      </main>

      {/* Agent Creation Modal */}
      {showAgentModal && (
        <AgentCreateModal
          projectId={projectId}
          onClose={() => setShowAgentModal(false)}
          onSuccess={handleAgentCreated}
        />
      )}

      {/* Task Creation Modal */}
      {showTaskModal && (
        <TaskCreateModal
          projectId={projectId}
          onClose={() => setShowTaskModal(false)}
          onSuccess={handleTaskCreated}
        />
      )}

      {/* GitHub Connect Modal */}
      {showGitHubModal && (
        <GitHubConnectModal
          isOpen={showGitHubModal}
          projectId={projectId}
          onClose={() => setShowGitHubModal(false)}
          onSuccess={handleGitHubConnected}
        />
      )}

      {/* API Key Management Modal */}
      {showAPIKeyModal && (
        <APIKeyManagementModal
          isOpen={showAPIKeyModal}
          onClose={() => setShowAPIKeyModal(false)}
        />
      )}
    </div>
  );
}

// Made with Bob
