
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
  const [pausing, setPausing] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [isOpen, projectId]);

  useEffect(() => {
    // Auto-scroll logs to bottom
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [status?.logs]);

  useEffect(() => {
    // Check if development is complete
    if (status?.status === 'completed') {
      stopPolling();
      onComplete();
    }
  }, [status?.status]);

  const startPolling = () => {
    loadStatus();
    pollIntervalRef.current = setInterval(loadStatus, 2000); // Poll every 2 seconds
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  };

  const loadStatus = async () => {
    try {
      const data = await api.getDevelopmentStatus(projectId);
      setStatus(data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load development status:', err);
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      setPausing(true);
      await api.pauseDevelopment(projectId);
      await loadStatus();
    } catch (err) {
