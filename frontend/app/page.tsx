'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Project } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await api.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const departments = [
    {
      id: 'dev',
      name: 'Development',
      icon: '💻',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      agents: 3,
      tasks: 12,
      progress: 75,
    },
    {
      id: 'design',
      name: 'Design',
      icon: '🎨',
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      agents: 2,
      tasks: 8,
      progress: 60,
    },
    {
      id: 'marketing',
      name: 'Marketing',
      icon: '📢',
      color: 'from-pink-500 to-pink-600',
      bgColor: 'bg-pink-50',
      agents: 2,
      tasks: 10,
      progress: 85,
    },
    {
      id: 'sales',
      name: 'Sales',
      icon: '💼',
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      agents: 4,
      tasks: 15,
      progress: 90,
    },
    {
      id: 'hr',
      name: 'Human Resources',
      icon: '👥',
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      agents: 2,
      tasks: 6,
      progress: 70,
    },
    {
      id: 'finance',
      name: 'Finance',
      icon: '💰',
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      agents: 2,
      tasks: 9,
      progress: 65,
    },
    {
      id: 'support',
      name: 'Customer Support',
      icon: '🎧',
      color: 'from-teal-500 to-teal-600',
      bgColor: 'bg-teal-50',
      agents: 3,
      tasks: 20,
      progress: 80,
    },
  ];

  const stats = [
    { label: 'Total Agents', value: '18', change: '+2', trend: 'up' },
    { label: 'Active Tasks', value: '80', change: '+12', trend: 'up' },
    { label: 'Completion Rate', value: '76%', change: '+5%', trend: 'up' },
    { label: 'GitHub Repos', value: '5', change: '+1', trend: 'up' },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                M
              </div>
              <div>
                <h1 className="text-xl font-bold gradient-text">MyCompany</h1>
                <p className="text-sm text-slate-600">AI-Powered Business Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button className="btn btn-secondary text-sm py-2">
                <span className="mr-2">⚙️</span>
                Settings
              </button>
              <button className="btn btn-primary text-sm py-2">
                <span className="mr-2">➕</span>
                New Project
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome Section */}
        <section className="animate-slide-up">
          <div className="card p-8 bg-gradient-to-br from-primary-50 to-secondary-50 border-primary-200/50">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold text-slate-900">
                  Welcome back, CEO! 👋
                </h2>
                <p className="text-lg text-slate-600">
                  {projects.length > 0
                    ? 'Your AI agents are working hard to grow your business'
                    : 'Create your first project to get started'}
                </p>
              </div>
              <div className="text-6xl animate-pulse-soft">🏢</div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        {loading ? (
          <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">📦</div>
              <p className="text-lg text-slate-600">Loading projects...</p>
            </div>
          </section>
        ) : projects.length > 0 ? (
          <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="section-header">
              <div>
                <h2 className="section-title">Your Projects</h2>
                <p className="text-slate-600 mt-1">Manage and monitor your AI-powered projects</p>
              </div>
              <button
                className="btn btn-primary text-sm py-2"
                onClick={() => router.push('/project/new')}
              >
                <span className="mr-2">➕</span>
                New Project
              </button>
            </div>

            <div className="grid-auto-fit">
              {projects.map((project, index) => (
                <div
                  key={project.id}
                  className="department-card group"
                  style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                  onClick={() => router.push(`/project/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">📁</div>
                    <span className={`badge ${
                      project.status === 'completed' ? 'badge-success' :
                      project.status === 'in_progress' ? 'badge-primary' :
                      project.status === 'failed' ? 'badge-danger' :
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}>
                      {project.status.replace('_', ' ')}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 mb-2">
                    {project.name}
                  </h3>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <div className="card p-12 text-center">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No projects yet
              </h3>
              <p className="text-slate-600 mb-6">
                Create your first project and let AI agents build it for you
              </p>
              <button
                className="btn btn-primary"
                onClick={() => router.push('/project/new')}
              >
                <span className="mr-2">➕</span>
                Create First Project
              </button>
            </div>
          </section>
        )}

        {/* Stats Grid */}
        <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card card-hover">
                <div className="flex items-center justify-between">
                  <div className="stat-label">{stat.label}</div>
                  <span className={`badge ${stat.trend === 'up' ? 'badge-success' : 'badge-danger'}`}>
                    {stat.change}
                  </span>
                </div>
                <div className="stat-value">{stat.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Departments Section */}
        <section className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="section-header">
            <div>
              <h2 className="section-title">Departments</h2>
              <p className="text-slate-600 mt-1">Manage your AI-powered teams</p>
            </div>
            <button className="btn btn-primary text-sm py-2">
              <span className="mr-2">➕</span>
              Add Department
            </button>
          </div>

          <div className="grid-auto-fit">
            {departments.map((dept, index) => (
              <div
                key={dept.id}
                className="department-card"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`department-icon bg-gradient-to-br ${dept.color} text-white shadow-md`}>
                    {dept.icon}
                  </div>
                  <span className="badge badge-primary">{dept.agents} agents</span>
                </div>

                <h3 className="text-lg font-semibold text-slate-900 mb-2">
                  {dept.name}
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Active Tasks</span>
                    <span className="font-semibold text-slate-900">{dept.tasks}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Progress</span>
                      <span className="font-semibold text-slate-900">{dept.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${dept.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-200">
                  <button className="w-full btn btn-secondary text-sm py-2 hover:bg-slate-100">
                    View Details →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="section-header">
            <h2 className="section-title">Quick Actions</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card card-hover p-6 cursor-pointer group">
              <div className="icon-container from-blue-500 to-blue-600 mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-2xl">📝</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Create Survey
              </h3>
              <p className="text-sm text-slate-600">
                Design a new survey to gather insights from your agents
              </p>
            </div>

            <div className="card card-hover p-6 cursor-pointer group">
              <div className="icon-container from-purple-500 to-purple-600 mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                Add Agent
              </h3>
              <p className="text-sm text-slate-600">
                Hire a new AI agent to join your team
              </p>
            </div>

            <div className="card card-hover p-6 cursor-pointer group">
              <div className="icon-container from-green-500 to-green-600 mb-4 group-hover:scale-110 transition-transform">
                <span className="text-white text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                View Analytics
              </h3>
              <p className="text-sm text-slate-600">
                Check detailed performance metrics and insights
              </p>
            </div>
          </div>
        </section>

        {/* Getting Started */}
        <section className="animate-slide-up" style={{ animationDelay: '0.7s' }}>
          <div className="card p-8 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <div className="flex items-start space-x-6">
              <div className="text-5xl">🚀</div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Getting Started Guide
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center text-white text-xs font-bold">
                      ✓
                    </div>
                    <span className="text-slate-600">Connect your GitHub account</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold">
                      2
                    </div>
                    <span className="text-slate-600">Create your first survey</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold">
                      3
                    </div>
                    <span className="text-slate-600">Hire AI agents for your departments</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded-full bg-slate-300 flex items-center justify-center text-white text-xs font-bold">
                      4
                    </div>
                    <span className="text-slate-600">Watch your business grow!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>© 2024 MyCompany. Built with AI-powered agents.</p>
            <div className="flex items-center space-x-6">
              <a href="#" className="hover:text-primary-600 transition-colors">Documentation</a>
              <a href="#" className="hover:text-primary-600 transition-colors">Support</a>
              <a href="#" className="hover:text-primary-600 transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Made with Bob
