import React from 'react';

interface AgentCardProps {
  name: string;
  role: string;
  status: 'idle' | 'working' | 'completed' | 'error';
  avatar: string;
  currentTask?: string;
  progress?: number;
  output?: string;
}

export default function AgentCard({
  name,
  role,
  status,
  avatar,
  currentTask,
  progress = 0,
  output,
}: AgentCardProps) {
  const statusConfig = {
    idle: {
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'Idle',
      icon: '💤',
    },
    working: {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      label: 'Working',
      icon: '⚡',
    },
    completed: {
      color: 'bg-green-100 text-green-700 border-green-200',
      label: 'Completed',
      icon: '✅',
    },
    error: {
      color: 'bg-red-100 text-red-700 border-red-200',
      label: 'Error',
      icon: '❌',
    },
  };

  const currentStatus = statusConfig[status];

  return (
    <div className="card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-2xl shadow-md">
            {avatar}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900">{name}</h3>
            <p className="text-sm text-slate-600">{role}</p>
          </div>
        </div>
        <span className={`badge ${currentStatus.color} flex items-center space-x-1`}>
          <span>{currentStatus.icon}</span>
          <span>{currentStatus.label}</span>
        </span>
      </div>

      {/* Current Task */}
      {currentTask && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Current Task:</div>
          <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3">
            {currentTask}
          </div>
        </div>
      )}

      {/* Progress */}
      {status === 'working' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold text-slate-900">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Output Preview */}
      {output && status === 'completed' && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-slate-700">Output:</div>
          <div className="text-sm text-slate-600 bg-slate-50 rounded-lg p-3 max-h-32 overflow-y-auto custom-scrollbar">
            {output}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
        <button className="flex-1 btn btn-secondary text-sm py-2">
          View Details
        </button>
        {status === 'completed' && (
          <button className="flex-1 btn btn-primary text-sm py-2">
            Download
          </button>
        )}
      </div>
    </div>
  );
}

// Made with Bob
