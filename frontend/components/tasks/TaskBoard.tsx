'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import TaskCard from './TaskCard';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'failed';
  priority: 'high' | 'medium' | 'low';
  progress: number;
  assigned_to?: string;
  assigned_to_name?: string;
}

interface TaskBoardProps {
  projectId: string;
  tasks: Task[];
  onTaskUpdate: () => void;
}

export default function TaskBoard({ projectId, tasks, onTaskUpdate }: TaskBoardProps) {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    loadAgents();
  }, [projectId]);

  const loadAgents = async () => {
    try {
      const data = await api.getAgents(projectId);
      setAgents(data);
    } catch (err) {
      console.error('Failed to load agents:', err);
    }
  };

  const handleStatusChange = async (
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'review' | 'completed' | 'blocked' | 'failed'
  ) => {
    try {
      await api.updateTaskStatus(taskId, newStatus);
      onTaskUpdate();
    } catch (err) {
      console.error('Failed to update task status:', err);
    }
  };

  const columns = [
    { id: 'pending', title: 'To Do', icon: '📋', color: 'border-slate-300' },
    { id: 'in_progress', title: 'In Progress', icon: '🔄', color: 'border-blue-300' },
    { id: 'review', title: 'Review', icon: '👀', color: 'border-purple-300' },
    { id: 'completed', title: 'Completed', icon: '✅', color: 'border-green-300' },
  ];

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const getAgentInfo = (agentId?: string) => {
    if (!agentId) return undefined;
    const agent = agents.find((a) => a.id === agentId);
    return agent
      ? {
          id: agent.id,
          name: agent.name,
          avatar: agent.avatar,
        }
      : undefined;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnTasks = getTasksByStatus(column.id);
        return (
          <div key={column.id} className="flex flex-col">
            {/* Column Header */}
            <div className={`card p-4 mb-4 border-t-4 ${column.color}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{column.icon}</span>
                  <h3 className="font-semibold text-slate-900">{column.title}</h3>
                </div>
                <span className="badge bg-slate-100 text-slate-700 border-slate-200">
                  {columnTasks.length}
                </span>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-4 flex-1">
              {columnTasks.length === 0 ? (
                <div className="card p-6 text-center text-slate-400">
                  <div className="text-4xl mb-2">📭</div>
                  <p className="text-sm">No tasks</p>
                </div>
              ) : (
                columnTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    title={task.title}
                    description={task.description}
                    status={task.status}
                    priority={task.priority}
                    progress={task.progress}
                    assignedTo={getAgentInfo(task.assigned_to)}
                    onStatusChange={(newStatus) => handleStatusChange(task.id, newStatus)}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Made with Bob