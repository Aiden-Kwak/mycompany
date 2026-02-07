'use client';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import PixelButton from '@/components/pixel/PixelButton';

interface DevelopmentProgressTrackerProps {
  isOpen: boolean;
  projectId: string;
  onClose: () => void;
  onComplete: () => void;
}

interface TaskProgress {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  message?: string;
}

interface DevelopmentStatus {
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'paused';
  overall_progress: number;
  tasks: TaskProgress[];
  generated_files: string[];
  logs: Array<{
    timestamp: string;
    level: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }>;
  error_message?: string;
}

export default function DevelopmentProgressTracker({
  isOpen,
  projectId,
  onClose,
  onComplete,
}: DevelopmentProgressTrackerProps) {
  const [status, setStatus] = useState<DevelopmentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogs, setShowLogs] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      loadStatus();
      // Simulate progress for demo
      const interval = setInterval(() => {
        setStatus(prev => {
          if (!prev) return null;
          const newProgress = Math.min(prev.overall_progress + 10, 100);
          return {
            ...prev,
            overall_progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'in_progress'
          };
        });
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  useEffect(() => {
    if (status?.status === 'completed') {
      setTimeout(() => onComplete(), 1000);
    }
  }, [status?.status]);

  const loadStatus = async () => {
    try {
      setLoading(false);
      // Initialize with demo data
      setStatus({
        status: 'in_progress',
        overall_progress: 0,
        tasks: [
          { id: '1', title: 'Setup Project Structure', status: 'in_progress', progress: 50 },
          { id: '2', title: 'Generate Backend API', status: 'pending', progress: 0 },
          { id: '3', title: 'Generate Frontend UI', status: 'pending', progress: 0 },
          { id: '4', title: 'Generate Tests', status: 'pending', progress: 0 },
        ],
        generated_files: [],
        logs: [
          { timestamp: new Date().toISOString(), level: 'info', message: 'Starting development...' }
        ]
      });
    } catch (err) {
      console.error('Failed to load development status:', err);
      setLoading(false);
    }
  };

  const getStatusIcon = (taskStatus: string) => {
    switch (taskStatus) {
      case 'completed': return '✅';
      case 'in_progress': return '⏳';
      case 'failed': return '❌';
      default: return '⏸️';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center">
                {status?.status === 'completed' ? '🎉' : '🚀'} Development {status?.status === 'completed' ? 'Completed' : 'in Progress'}
              </h2>
              <p className="text-sm text-primary-100 mt-1">
                AI is generating your project code
              </p>
            </div>
            {status?.status === 'completed' && (
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 animate-bounce">⚙️</div>
              <p className="text-slate-600">Loading development status...</p>
            </div>
          ) : status?.status === 'completed' ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-xl font-semibold text-green-900 mb-2">
                Development Completed Successfully!
              </h3>
              <p className="text-green-700 mb-4">
                Generated {status.generated_files.length} files
              </p>
              <div className="flex justify-center space-x-3">
                <PixelButton variant="success" onClick={onClose}>
                  Close
                </PixelButton>
              </div>
            </div>
          ) : (
            <>
              {/* Overall Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900">Overall Progress</h3>
                  <span className="text-2xl font-bold text-primary-600">
                    {Math.round(status?.overall_progress || 0)}%
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-primary-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${status?.overall_progress || 0}%` }}
                  />
                </div>
              </div>

              {/* Tasks */}
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Tasks</h3>
                <div className="space-y-3">
                  {status?.tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        task.status === 'in_progress'
                          ? 'border-primary-300 bg-primary-50 animate-pulse'
                          : task.status === 'completed'
                          ? 'border-green-300 bg-green-50'
                          : task.status === 'failed'
                          ? 'border-red-300 bg-red-50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{getStatusIcon(task.status)}</span>
                          <div>
                            <div className="font-semibold text-slate-900">{task.title}</div>
                            {task.message && (
                              <div className="text-sm text-slate-600">{task.message}</div>
                            )}
                          </div>
                        </div>
                        <span className="text-sm font-medium text-slate-600">
                          {task.progress}%
                        </span>
                      </div>
                      {task.status === 'in_progress' && (
                        <div className="w-full bg-slate-200 rounded-full h-1.5">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Logs */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-slate-900">📋 Live Logs</h3>
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {showLogs ? 'Hide' : 'Show'} Logs
                  </button>
                </div>
                {showLogs && (
                  <div className="bg-slate-900 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
                    {status?.logs && status.logs.length > 0 ? (
                      <div className="space-y-1">
                        {status.logs.map((log, index) => (
                          <div
                            key={index}
                            className={`${
                              log.level === 'error'
                                ? 'text-red-400'
                                : log.level === 'warning'
                                ? 'text-yellow-400'
                                : log.level === 'success'
                                ? 'text-green-400'
                                : 'text-slate-300'
                            }`}
                          >
                            <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>{' '}
                            {log.message}
                          </div>
                        ))}
                        <div ref={logsEndRef} />
                      </div>
                    ) : (
                      <div className="text-slate-500 text-center py-4">No logs yet</div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {status && status.status !== 'completed' && (
          <div className="p-6 border-t border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-600">
                🔄 Refreshing every 2 seconds...
              </div>
              <div className="flex space-x-3">
                <PixelButton variant="secondary" onClick={onClose}>
                  Close
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
