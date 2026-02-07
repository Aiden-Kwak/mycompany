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
import PlanningDocumentModal from '@/components/planning/PlanningDocumentModal';
import AutoDevelopmentModal from '@/components/planning/AutoDevelopmentModal';
import DevelopmentProgressTracker from '@/components/planning/DevelopmentProgressTracker';

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
  const [showPlanningModal, setShowPlanningModal] = useState(false);
  const [showDevelopmentModal, setShowDevelopmentModal] = useState(false);
  const [showProgressTracker, setShowProgressTracker] = useState(false);
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');
  const [planningDocument, setPlanningDocument] = useState<any>(null);
  const [developmentStatus, setDevelopmentStatus] = useState<'idle' | 'planning' | 'ready' | 'developing' | 'completed'>('idle');

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

        {/* AI Configuration & Automation */}
        <section className="animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">🤖 AI-Powered Automation</h2>
          
          {/* AI Provider Setup */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* API Keys Status */}
            <PixelCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">🔑 AI Provider Setup</h3>
                <PixelButton
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowAPIKeyModal(true)}
                >
                  Manage Keys
                </PixelButton>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🤖</span>
                    <div>
                      <div className="font-medium text-slate-900">OpenAI (GPT-4)</div>
                      <div className="text-sm text-slate-600">For code generation</div>
                    </div>
                  </div>
                  <span className="badge badge-success">✓ Active</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">🧠</span>
                    <div>
                      <div className="font-medium text-slate-900">Anthropic (Claude)</div>
                      <div className="text-sm text-slate-600">For planning & review</div>
                    </div>
                  </div>
                  <span className="badge bg-slate-200 text-slate-600">Not configured</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">💎</span>
                    <div>
                      <div className="font-medium text-slate-900">Google (Gemini)</div>
                      <div className="text-sm text-slate-600">Alternative provider</div>
                    </div>
                  </div>
                  <span className="badge bg-slate-200 text-slate-600">Not configured</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600">ℹ️</span>
                  <div className="text-sm text-blue-800">
                    <strong>Tip:</strong> Configure at least one AI provider to enable automated development.
                  </div>
                </div>
              </div>
            </PixelCard>

            {/* Development Status */}
            <PixelCard className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">📊 Automation Status</h3>
              
              <div className="space-y-4">
                {/* Planning Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Planning Document</span>
                    {planningDocument ? (
                      <span className="badge badge-success">✓ Generated</span>
                    ) : (
                      <span className="badge bg-slate-200 text-slate-600">Not started</span>
                    )}
                  </div>
                  {planningDocument && (
                    <p className="text-sm text-slate-600">
                      {planningDocument.executive_summary?.substring(0, 100)}...
                    </p>
                  )}
                </div>

                {/* Agents Status */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">AI Agents</span>
                    <span className="badge badge-primary">{agents.length} agents</span>
                  </div>
                  {agents.length > 0 && (
                    <div className="flex -space-x-2">
                      {agents.slice(0, 5).map((agent) => (
                        <div
                          key={agent.id}
                          className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center text-lg"
                          title={agent.name}
                        >
                          {agent.avatar}
                        </div>
                      ))}
                      {agents.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-xs font-medium">
                          +{agents.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Development Progress */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Development Progress</span>
                    <span className="text-sm font-semibold text-primary-600">0%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-primary-500 h-2 rounded-full" style={{ width: '0%' }} />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="text-sm text-slate-600">
                  <strong>Next Step:</strong> {
                    !planningDocument ? 'Generate planning document' :
                    agents.length === 0 ? 'Create AI agents' :
                    'Start automated development'
                  }
                </div>
              </div>
            </PixelCard>
          </div>

          {/* Automation Actions */}
          <PixelCard className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 border-2 border-primary-200">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">🚀 Automated Development Workflow</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Step 1 */}
              <div className="relative">
                <div className={`p-4 rounded-lg border-2 ${
                  planningDocument ? 'bg-green-50 border-green-300' : 'bg-white border-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">📋</span>
                    {planningDocument && <span className="text-green-600">✓</span>}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">Step 1: Planning</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    AI analyzes requirements and generates PRD
                  </p>
                  <PixelButton
                    variant={planningDocument ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => setShowPlanningModal(true)}
                    className="w-full"
                  >
                    {planningDocument ? 'View Document' : '🤖 Generate Planning'}
                  </PixelButton>
                </div>
                {/* Arrow */}
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-2xl text-slate-400">
                  →
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative">
                <div className={`p-4 rounded-lg border-2 ${
                  agents.length > 0 ? 'bg-green-50 border-green-300' : 'bg-white border-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">🤖</span>
                    {agents.length > 0 && <span className="text-green-600">✓</span>}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">Step 2: Agents</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    Auto-create specialized AI agents
                  </p>
                  <PixelButton
                    variant="secondary"
                    size="sm"
                    disabled={!planningDocument}
                    className="w-full"
                  >
                    {agents.length > 0 ? `${agents.length} Agents` : 'Create Agents'}
                  </PixelButton>
                </div>
                {/* Arrow */}
                <div className="hidden md:block absolute top-1/2 -right-2 transform -translate-y-1/2 text-2xl text-slate-400">
                  →
                </div>
              </div>

              {/* Step 3 */}
              <div>
                <div className={`p-4 rounded-lg border-2 ${
                  developmentStatus === 'completed' ? 'bg-green-50 border-green-300' : 'bg-white border-slate-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">💻</span>
                    {developmentStatus === 'completed' && <span className="text-green-600">✓</span>}
                  </div>
                  <h4 className="font-semibold text-slate-900 mb-1">Step 3: Development</h4>
                  <p className="text-sm text-slate-600 mb-3">
                    AI generates complete codebase
                  </p>
                  <PixelButton
                    variant="success"
                    size="sm"
                    disabled={!planningDocument || agents.length === 0}
                    onClick={() => setShowDevelopmentModal(true)}
                    className="w-full"
                  >
                    🚀 Start Development
                  </PixelButton>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-2 text-sm text-slate-600">
              <span>⏱️</span>
              <span>Estimated time: 10-15 minutes</span>
              <span>•</span>
              <span>💰</span>
              <span>Estimated cost: $2-5</span>
            </div>
          </PixelCard>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <PixelCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">⚡ Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
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

      {/* Planning Document Modal */}
      {showPlanningModal && (
        <PlanningDocumentModal
          isOpen={showPlanningModal}
          projectId={projectId}
          onClose={() => setShowPlanningModal(false)}
          onSuccess={(doc) => {
            setPlanningDocument(doc);
            setDevelopmentStatus('ready');
            loadProject(); // Reload to get auto-created agents
          }}
        />
      )}

      {/* Auto Development Modal */}
      {showDevelopmentModal && (
        <AutoDevelopmentModal
          isOpen={showDevelopmentModal}
          projectId={projectId}
          planningDocument={planningDocument}
          onClose={() => setShowDevelopmentModal(false)}
          onStart={() => {
            setShowDevelopmentModal(false);
            setShowProgressTracker(true);
            setDevelopmentStatus('developing');
          }}
        />
      )}

      {/* Development Progress Tracker */}
      {showProgressTracker && (
        <DevelopmentProgressTracker
          isOpen={showProgressTracker}
          projectId={projectId}
          onClose={() => setShowProgressTracker(false)}
          onComplete={() => {
            setDevelopmentStatus('completed');
            loadProject();
          }}
        />
      )}
    </div>
  );
}

// Made with Bob
