'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PixelButton from '@/components/pixel/PixelButton';

interface AutoDevelopmentModalProps {
  isOpen: boolean;
  projectId: string;
  planningDocument: any;
  onClose: () => void;
  onStart: () => void;
}

export default function AutoDevelopmentModal({
  isOpen,
  projectId,
  planningDocument,
  onClose,
  onStart,
}: AutoDevelopmentModalProps) {
  const [provider, setProvider] = useState<'openai' | 'anthropic' | 'google' | 'groq'>('openai');
  const [model, setModel] = useState('gpt-4');
  const [parallelExecution, setParallelExecution] = useState(true);
  const [autoCommit, setAutoCommit] = useState(true);
  const [notifyOnCompletion, setNotifyOnCompletion] = useState(false);
  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadAPIKeys();
    }
  }, [isOpen]);

  const loadAPIKeys = async () => {
    try {
      setLoading(true);
      const keys = await api.getActiveAPIKeys();
      setApiKeys(keys);
      
      // Set default provider based on available API keys
      if (keys.length > 0) {
        const firstKey = keys[0];
        setProvider(firstKey.service_type);
        setModel(getDefaultModel(firstKey.service_type));
      }
    } catch (err) {
      console.error('Failed to load API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDefaultModel = (providerType: string): string => {
    const models: Record<string, string> = {
      openai: 'gpt-4',
      anthropic: 'claude-3-opus-20240229',
      google: 'gemini-pro',
      groq: 'mixtral-8x7b-32768',
    };
    return models[providerType] || 'gpt-4';
  };

  const getAvailableModels = (providerType: string): string[] => {
    const models: Record<string, string[]> = {
      openai: ['gpt-4', 'gpt-4-turbo-preview', 'gpt-3.5-turbo'],
      anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      google: ['gemini-pro', 'gemini-pro-vision'],
      groq: ['mixtral-8x7b-32768', 'llama2-70b-4096'],
    };
    return models[providerType] || [];
  };

  const estimateCost = (): { min: number; max: number } => {
    const costs: Record<string, { min: number; max: number }> = {
      'gpt-4': { min: 3.0, max: 8.0 },
      'gpt-4-turbo-preview': { min: 2.0, max: 5.0 },
      'gpt-3.5-turbo': { min: 0.5, max: 1.5 },
      'claude-3-opus-20240229': { min: 4.0, max: 10.0 },
      'claude-3-sonnet-20240229': { min: 2.0, max: 5.0 },
      'claude-3-haiku-20240307': { min: 0.5, max: 1.5 },
      'gemini-pro': { min: 1.0, max: 3.0 },
      'mixtral-8x7b-32768': { min: 0.3, max: 1.0 },
      'llama2-70b-4096': { min: 0.2, max: 0.8 },
    };
    return costs[model] || { min: 1.0, max: 3.0 };
  };

  const estimateTime = (): string => {
    if (parallelExecution) {
      return '10-15 minutes';
    }
    return '20-30 minutes';
  };

  const handleStart = async () => {
    try {
      setStarting(true);
      await api.startDevelopment(projectId, {
        provider,
        model,
        parallel_execution: parallelExecution,
        auto_commit: autoCommit,
      });
      onStart();
    } catch (err) {
      console.error('Failed to start development:', err);
      alert('Failed to start development. Please check your API keys and try again.');
    } finally {
      setStarting(false);
    }
  };

  const hasAPIKey = apiKeys.some((key) => key.service_type === provider && key.is_active);

  if (!isOpen) return null;

  const cost = estimateCost();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">🚀 Start Automated Development</h2>
              <p className="text-sm text-primary-100 mt-1">
                Configure AI settings and start generating code
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">⚙️</div>
              <p className="text-slate-600">Loading configuration...</p>
            </div>
          ) : (
            <>
              {/* AI Provider Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">AI Provider Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Provider
                    </label>
                    <select
                      value={provider}
                      onChange={(e) => {
                        const newProvider = e.target.value as any;
                        setProvider(newProvider);
                        setModel(getDefaultModel(newProvider));
                      }}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="openai">OpenAI (GPT-4, GPT-3.5)</option>
                      <option value="anthropic">Anthropic (Claude 3)</option>
                      <option value="google">Google (Gemini)</option>
                      <option value="groq">Groq (Mixtral, Llama)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Model
                    </label>
                    <select
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {getAvailableModels(provider).map((m) => (
                        <option key={m} value={m}>
                          {m}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                    {hasAPIKey ? (
                      <>
                        <span className="text-green-500">✓</span>
                        <span className="text-sm text-slate-700">API Key configured</span>
                      </>
                    ) : (
                      <>
                        <span className="text-red-500">⚠️</span>
                        <span className="text-sm text-slate-700">No API key found for {provider}</span>
                        <button
                          onClick={() => {/* Open API key modal */}}
                          className="text-sm text-primary-600 hover:text-primary-700 font-medium ml-auto"
                        >
                          Add API Key
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Task Configuration */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tasks to Execute</h3>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked disabled className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Setup Project Structure</div>
                      <div className="text-sm text-slate-600">Initialize project files and dependencies</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked disabled className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Generate Backend API</div>
                      <div className="text-sm text-slate-600">Create models, routes, and controllers</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked disabled className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Generate Frontend UI</div>
                      <div className="text-sm text-slate-600">Create components and pages</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 p-3 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="checkbox" checked disabled className="w-4 h-4" />
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">Generate Tests</div>
                      <div className="text-sm text-slate-600">Create unit and integration tests</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Options */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Options</h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={parallelExecution}
                      onChange={(e) => setParallelExecution(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-slate-900">Run tasks in parallel</div>
                      <div className="text-sm text-slate-600">Faster execution but higher cost</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCommit}
                      onChange={(e) => setAutoCommit(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-slate-900">Auto-commit to GitHub</div>
                      <div className="text-sm text-slate-600">Automatically push generated code</div>
                    </div>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notifyOnCompletion}
                      onChange={(e) => setNotifyOnCompletion(e.target.checked)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <div>
                      <div className="font-medium text-slate-900">Send notification on completion</div>
                      <div className="text-sm text-slate-600">Get notified when development finishes</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Estimates */}
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-lg p-4 border border-primary-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-primary-700 mb-1">💰 Estimated Cost</div>
                    <div className="text-2xl font-bold text-primary-900">
                      ${cost.min.toFixed(2)} - ${cost.max.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-primary-700 mb-1">⏱️ Estimated Time</div>
                    <div className="text-2xl font-bold text-primary-900">{estimateTime()}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 bg-slate-50">
          <div className="flex items-center justify-end space-x-3">
            <PixelButton variant="secondary" onClick={onClose} disabled={starting}>
              Cancel
            </PixelButton>
            <PixelButton
              variant="primary"
              onClick={handleStart}
              disabled={!hasAPIKey || starting}
            >
              {starting ? (
                <>
                  <span className="animate-spin mr-2">⚙️</span>
                  Starting...
                </>
              ) : (
                <>🚀 Start Development</>
              )}
            </PixelButton>
          </div>
        </div>
      </div>
    </div>
  );
}

// Made with Bob