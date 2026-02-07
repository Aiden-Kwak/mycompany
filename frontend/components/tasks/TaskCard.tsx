import React from 'react';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'failed';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  assignedTo?: {
    id: string;
    name: string;
    avatar: string;
  };
  onStatusChange?: (newStatus: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'failed') => void;
  onClick?: () => void;
}

export default function TaskCard({
  id,
  title,
  description,
  status,
  priority,
  progress,
  assignedTo,
  onStatusChange,
  onClick,
}: TaskCardProps) {
  const statusConfig = {
    pending: {
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      label: 'Pending',
      icon: '⏳',
    },
    in_progress: {
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      label: 'In Progress',
      icon: '🔄',
    },
    review: {
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      label: 'Review',
      icon: '👀',
    },
    completed: {
      color: 'bg-green-100 text-green-700 border-green-200',
      label: 'Completed',
      icon: '✅',
    },
    blocked: {
      color: 'bg-orange-100 text-orange-700 border-orange-200',
      label: 'Blocked',
      icon: '🚧',
    },
    failed: {
      color: 'bg-red-100 text-red-700 border-red-200',
      label: 'Failed',
      icon: '❌',
    },
  };

  const priorityConfig = {
    high: {
      color: 'bg-red-100 text-red-700 border-red-200',
      label: 'High',
      icon: '🔴',
    },
    medium: {
      color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      label: 'Medium',
      icon: '🟡',
    },
    low: {
      color: 'bg-green-100 text-green-700 border-green-200',
      label: 'Low',
      icon: '🟢',
    },
  };

  const currentStatus = statusConfig[status];
  const currentPriority = priorityConfig[priority];

  return (
    <div
      className="card p-4 space-y-3 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900 mb-1 line-clamp-2">
            {title}
          </h3>
          <p className="text-sm text-slate-600 line-clamp-2">{description}</p>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center space-x-2">
        <span className={`badge ${currentStatus.color} text-xs flex items-center space-x-1`}>
          <span>{currentStatus.icon}</span>
          <span>{currentStatus.label}</span>
        </span>
        <span className={`badge ${currentPriority.color} text-xs flex items-center space-x-1`}>
          <span>{currentPriority.icon}</span>
          <span>{currentPriority.label}</span>
        </span>
      </div>

      {/* Progress Bar */}
      {status === 'in_progress' && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Progress</span>
            <span className="font-semibold text-slate-900">{progress}%</span>
          </div>
          <div className="progress-bar h-1.5">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Assigned Agent */}
      {assignedTo && (
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center text-sm">
            {assignedTo.avatar}
          </div>
          <span className="text-xs text-slate-600">{assignedTo.name}</span>
        </div>
      )}

      {/* Quick Actions */}
      {onStatusChange && status !== 'completed' && (
        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200">
          {status === 'pending' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('in_progress');
              }}
              className="flex-1 btn btn-primary text-xs py-1.5"
            >
              Start
            </button>
          )}
          {status === 'in_progress' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('review');
                }}
                className="flex-1 btn btn-secondary text-xs py-1.5"
              >
                Review
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange('blocked');
                }}
                className="flex-1 btn btn-secondary text-xs py-1.5"
              >
                Block
              </button>
            </>
          )}
          {status === 'review' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onStatusChange('completed');
              }}
              className="flex-1 btn btn-primary text-xs py-1.5"
            >
              Complete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Made with Bob