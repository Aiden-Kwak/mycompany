'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import PixelButton from '@/components/pixel/PixelButton';
import PixelCard from '@/components/pixel/PixelCard';

interface PlanningDocumentModalProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onSuccess: (document: any) => void;
}

export default function PlanningDocumentModal({
  isOpen,
  projectId,
  onClose,
  onSuccess,
}: PlanningDocumentModalProps) {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [document, setDocument] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'summary' | 'technical' | 'features' | 'plan' | 'timeline'>('summary');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadExistingDocument();
    }
  }, [isOpen, projectId]);

  const loadExistingDocument = async () => {
    try {
      setLoading(true);
      const doc = await api.getPlanningDocument(projectId);
      setDocument(doc);
    } catch (err) {
      // No existing document, that's okay
      console.log('No existing planning document');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      const result = await api.generatePlanningDocument(projectId);
      setDocument(result);
    } catch (err) {
      console.error('Failed to generate planning document:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate planning document');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = () => {
    if (document) {
      onSuccess(document);
      onClose();
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'summary', label: '📋 Executive Summary', icon: '📋' },
    { id: 'technical', label: '⚙️ Technical Requirements', icon: '⚙️' },
    { id: 'features', label: '✨ Features', icon: '✨' },
    { id: 'plan', label: '🗺️ Development Plan', icon: '🗺️' },
    { id: 'timeline', label: '📅 Timeline', icon: '📅' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">🤖 AI Planning Document</h2>
              <p className="text-sm text-slate-600 mt-1">
                AI-generated project requirements and development plan
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">📋</div>
              <p className="text-slate-600">Loading planning document...</p>
            </div>
          ) : generating ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">🤖</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                AI is analyzing your requirements...
              </h3>
              <p className="text-slate-600 mb-6">
                This may take 30-60 seconds
              </p>
              <div className="w-64 mx-auto bg-slate-200 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
              <div className="mt-6 space-y-2 text-sm text-slate-500">
                <p>✓ Analyzing project requirements</p>
                <p className="animate-pulse">⏳ Generating technical specifications...</p>
                <p className="text-slate-300">○ Creating development plan</p>
                <p className="text-slate-300">○ Recommending agents</p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">❌</div>
              <h3 className="text-xl font-semibold text-red-900 mb-2">Generation Failed</h3>
              <p className="text-red-700 mb-6">{error}</p>
              <div className="space-x-3">
                <PixelButton variant="danger" onClick={handleGenerate}>
                  Try Again
                </PixelButton>
                <PixelButton variant="secondary" onClick={onClose}>
                  Cancel
                </PixelButton>
              </div>
            </div>
          ) : !document ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No Planning Document Yet
              </h3>
              <p className="text-slate-600 mb-6">
                Generate an AI-powered planning document based on your project requirements
              </p>
              <PixelButton variant="primary" size="lg" onClick={handleGenerate}>
                🤖 Generate Planning Document
              </PixelButton>
            </div>
          ) : (
            <>
              {/* Tabs */}
              <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tab.icon} {tab.label.split(' ').slice(1).join(' ')}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'summary' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">📋 Executive Summary</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap">{document.executive_summary}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'technical' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">⚙️ Technical Requirements</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap">{document.technical_requirements}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'features' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">✨ Feature Specifications</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap">{document.feature_specifications}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'plan' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">🗺️ Development Plan</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap">{document.development_plan}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'timeline' && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">📅 Timeline & Milestones</h3>
                    <div className="prose prose-slate max-w-none">
                      <p className="text-slate-700 whitespace-pre-wrap">{document.timeline}</p>
                    </div>
                  </div>
                )}

                {/* Agent Recommendations */}
                {document.agent_recommendations && document.agent_recommendations.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-slate-200">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4">
                      🤖 Recommended Agents ({document.agent_recommendations.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {document.agent_recommendations.map((agent: any, index: number) => (
                        <div
                          key={index}
                          className="bg-slate-50 rounded-lg p-4 border border-slate-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">{agent.avatar}</span>
                              <div>
                                <div className="font-semibold text-slate-900">{agent.name}</div>
                                <div className="text-sm text-slate-600">{agent.role}</div>
                              </div>
                            </div>
                            {agent.created && (
                              <span className="badge badge-success text-xs">Created</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mb-2">
                            {agent.department} • {agent.skills.join(', ')}
                          </div>
                          <p className="text-sm text-slate-600">{agent.justification}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {document && !generating && !error && (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Generated {new Date(document.created_at).toLocaleString()}
              </div>
              <div className="flex space-x-3">
                <PixelButton variant="secondary" onClick={handleGenerate}>
                  🔄 Regenerate
                </PixelButton>
                <PixelButton variant="primary" onClick={handleApprove}>
                  ✅ Approve & Continue
                </PixelButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Made with Bob