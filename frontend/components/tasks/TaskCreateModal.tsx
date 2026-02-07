'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Agent } from '@/lib/types';
import PixelButton from '@/components/pixel/PixelButton';

interface TaskCreateModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TaskCreateModal({
  projectId,
  onClose,
  onSuccess,
}: TaskCreateModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assigned_to: '',
  });
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAgents();
  }, [projectId]);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents(projectId);
      // Ensure data is an array
      if (Array.isArray(data)) {
        setAgents(data);
      } else {
        console.error('Invalid agents data format:', data);
        setAgents([]);
      }
    } catch (err) {
      console.error('Failed to load agents:', err);
      setAgents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!formData.description.trim()) {
      setError('Task description is required');
      return;
    }

    try {
      setLoading(true);
      await api.createTask({
        project: projectId,
        assigned_to: formData.assigned_to || undefined,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Create New Task</h2>
              <p className="text-sm text-slate-600 mt-1">
                Add a new task to your project
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Task Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Implement user authentication"
              className="input w-full"
              required
            />
          </div>

          {/* Task Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task in detail..."
              rows={4}
              className="input w-full resize-none"
              required
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Priority
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['high', 'medium', 'low'] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, priority }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.priority === priority
                      ? priority === 'high'
                        ? 'border-red-500 bg-red-50'
                        : priority === 'medium'
                        ? 'border-yellow-500 bg-yellow-50'
                        : 'border-green-500 bg-green-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-1">
                      {priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢'}
                    </div>
                    <div className="text-sm font-medium capitalize">{priority}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Assign to Agent */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Assign to Agent (Optional)
            </label>
            {!Array.isArray(agents) || agents.length === 0 ? (
              <div className="text-sm text-slate-500 bg-slate-50 rounded-lg p-4 text-center">
                No agents available. Create agents first to assign tasks.
              </div>
            ) : (
              <select
                name="assigned_to"
                value={formData.assigned_to}
                onChange={handleChange}
                className="input w-full"
              >
                <option value="">Unassigned</option>
                {agents.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.avatar} {agent.name} - {agent.role}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
            <PixelButton
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </PixelButton>
            <PixelButton
              type="submit"
              variant="primary"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Creating...</span>
                </span>
              ) : (
                'Create Task'
              )}
            </PixelButton>
          </div>
        </form>
      </div>
    </div>
  );
}

// Made with Bob