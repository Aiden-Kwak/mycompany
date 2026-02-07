'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Project } from '@/lib/types';
import PixelCard from '@/components/pixel/PixelCard';
import PixelButton from '@/components/pixel/PixelButton';
import AgentCard from '@/components/agents/AgentCard';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const [projectData, statsData] = await Promise.all([
        api.getProject(projectId),
        api.getProjectStats(projectId),
      ]);
      setProject(projectData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load project:', err);
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
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

        {/* Agents Section (Placeholder) */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900">AI Agents</h2>
            <PixelButton variant="primary" size="sm">
              + Add Agent
            </PixelButton>
          </div>
          
          {stats?.total_agents === 0 ? (
            <PixelCard className="p-12 text-center">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No agents yet
              </h3>
              <p className="text-slate-600 mb-6">
                Add AI agents to start working on your project
              </p>
              <PixelButton variant="primary">
                Create First Agent
              </PixelButton>
            </PixelCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sample agent cards - will be replaced with real data */}
              <AgentCard
                name="Alice"
                role="Frontend Developer"
                status="idle"
                avatar="👩‍💻"
                progress={0}
              />
            </div>
          )}
        </section>

        {/* Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <PixelCard className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-3">
              <PixelButton variant="primary">
                🚀 Start Development
              </PixelButton>
              <PixelButton variant="secondary">
                📊 View Analytics
              </PixelButton>
              <PixelButton variant="secondary">
                ⚙️ Project Settings
              </PixelButton>
              <PixelButton variant="secondary">
                🔗 Connect GitHub
              </PixelButton>
            </div>
          </PixelCard>
        </section>
      </main>
    </div>
  );
}

// Made with Bob
