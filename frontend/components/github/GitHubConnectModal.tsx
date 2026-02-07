'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { GitHubRepository } from '@/lib/types';

interface GitHubConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  onSuccess: (repository: GitHubRepository) => void;
}

export default function GitHubConnectModal({
  isOpen,
  onClose,
  projectId,
  onSuccess,
}: GitHubConnectModalProps) {
  const [step, setStep] = useState<'connect' | 'create'>('connect');
  const [repoName, setRepoName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleCreateRepository = async () => {
    if (!repoName.trim()) {
      setError('Repository name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const repository = await api.createGitHubRepository({
        project_id: parseInt(projectId),
        name: repoName,
        description: description || undefined,
        private: isPrivate,
        auto_init: true,
      });

      onSuccess(repository);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create repository');
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubConnect = () => {
    // OAuth flow will be implemented later
    // For now, show the create repository form
    setStep('create');
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full pixel-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 pixel-font">
              🔗 Connect GitHub
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {step === 'connect' ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                Connect your GitHub account to automatically create and manage repositories for your project.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">✨ Features</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Auto-create project repository</li>
                  <li>• Commit code changes automatically</li>
                  <li>• Track development progress</li>
                  <li>• Manage branches and PRs</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <button
                onClick={handleGitHubConnect}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 
                         transition-colors font-semibold flex items-center justify-center gap-2
                         disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                {loading ? 'Connecting...' : 'Connect with GitHub'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Repository Name *
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-awesome-project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="A brief description of your project..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="private"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="private" className="text-sm text-gray-700">
                  Make repository private
                </label>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('connect')}
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 
                           transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateRepository}
                  disabled={loading || !repoName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 
                           transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Repository'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Made with Bob