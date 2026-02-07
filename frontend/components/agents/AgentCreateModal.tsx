'use client';

import { useState } from 'react';
import PixelButton from '../pixel/PixelButton';
import PixelCard from '../pixel/PixelCard';

interface AgentCreateModalProps {
  projectId: string;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLES = [
  { value: 'product_manager', label: 'Product Manager', icon: '📋' },
  { value: 'ui_ux_designer', label: 'UI/UX Designer', icon: '🎨' },
  { value: 'frontend_developer', label: 'Frontend Developer', icon: '💻' },
  { value: 'backend_developer', label: 'Backend Developer', icon: '⚙️' },
  { value: 'qa_engineer', label: 'QA Engineer', icon: '🧪' },
  { value: 'devops_engineer', label: 'DevOps Engineer', icon: '🚀' },
  { value: 'data_analyst', label: 'Data Analyst', icon: '📊' },
];

const DEPARTMENTS = [
  { value: 'development', label: 'Development', color: 'from-blue-500 to-blue-600' },
  { value: 'design', label: 'Design', color: 'from-purple-500 to-purple-600' },
  { value: 'marketing', label: 'Marketing', color: 'from-pink-500 to-pink-600' },
  { value: 'sales', label: 'Sales', color: 'from-green-500 to-green-600' },
  { value: 'hr', label: 'Human Resources', color: 'from-orange-500 to-orange-600' },
  { value: 'finance', label: 'Finance', color: 'from-yellow-500 to-yellow-600' },
  { value: 'support', label: 'Customer Support', color: 'from-teal-500 to-teal-600' },
];

const AVATARS = ['🤖', '👨‍💻', '👩‍💻', '🧑‍💼', '👨‍🔬', '👩‍🔬', '🧙‍♂️', '🧙‍♀️'];

export default function AgentCreateModal({ projectId, onClose, onSuccess }: AgentCreateModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    avatar: '🤖',
    skills: [] as string[],
  });
  const [skillInput, setSkillInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const { api } = await import('@/lib/api');
      await api.createAgent({
        project: projectId,
        ...formData,
      });
      onSuccess();
    } catch (err) {
      console.error('Failed to create agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to create agent');
      setIsSubmitting(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()],
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <PixelCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Create New Agent</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Agent Name *
              </label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Alice, Bob, Charlie"
                required
              />
            </div>

            {/* Avatar */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Avatar
              </label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map(avatar => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, avatar }))}
                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                      formData.avatar === avatar
                        ? 'bg-primary-100 border-2 border-primary-500 scale-110'
                        : 'bg-slate-100 border-2 border-transparent hover:bg-slate-200'
                    }`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, role: role.value }))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      formData.role === role.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">{role.icon}</span>
                      <span className="text-sm font-medium text-slate-900">{role.label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Department *
              </label>
              <select
                className="input"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                required
              >
                <option value="">Select a department...</option>
                {DEPARTMENTS.map(dept => (
                  <option key={dept.value} value={dept.value}>
                    {dept.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Skills
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  className="input flex-1"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="Add a skill..."
                />
                <PixelButton type="button" onClick={addSkill} variant="secondary">
                  Add
                </PixelButton>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.skills.map(skill => (
                  <span
                    key={skill}
                    className="badge badge-primary flex items-center space-x-1"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-primary-900"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
              <PixelButton
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </PixelButton>
              <PixelButton
                type="submit"
                variant="primary"
                disabled={isSubmitting || !formData.name || !formData.role || !formData.department}
              >
                {isSubmitting ? 'Creating...' : 'Create Agent'}
              </PixelButton>
            </div>
          </form>
        </div>
      </PixelCard>
    </div>
  );
}

// Made with Bob
