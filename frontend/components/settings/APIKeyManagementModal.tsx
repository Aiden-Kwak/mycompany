'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface AIService {
  service_type: string;
  name: string;
  description: string;
  signup_url: string;
  docs_url: string;
  key_format: string;
}

interface APIKey {
  id: string;
  service_type: string;
  service_name: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string;
}

interface APIKeyManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function APIKeyManagementModal({
  isOpen,
  onClose,
}: APIKeyManagementModalProps) {
  const [services, setServices] = useState<AIService[]>([]);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [selectedService, setSelectedService] = useState<string>('');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      const [servicesData, keysData] = await Promise.all([
        api.getAIServices(),
        api.getAPIKeys(),
      ]);
      setServices(servicesData);
      setAPIKeys(keysData);
    } catch (err: any) {
      setError('Failed to load API services');
    }
  };

  const handleAddKey = async () => {
    if (!selectedService || !apiKeyInput.trim()) {
      setError('Please select a service and enter an API key');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.createAPIKey({
        service_type: selectedService,
        api_key: apiKeyInput,
      });
      
      setSuccess('API key added successfully!');
      setApiKeyInput('');
      setSelectedService('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to add API key');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (keyId: string, currentStatus: boolean) => {
    try {
      await api.updateAPIKey(keyId, { is_active: !currentStatus });
      await loadData();
    } catch (err: any) {
      setError('Failed to update API key status');
    }
  };

  const handleDeleteKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }

    try {
      await api.deleteAPIKey(keyId);
      await loadData();
      setSuccess('API key deleted successfully');
    } catch (err: any) {
      setError('Failed to delete API key');
    }
  };

  const getServiceInfo = (serviceType: string) => {
    return services.find(s => s.service_type === serviceType);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto pixel-border">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 pixel-font">
              🔑 AI Service API Keys
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
        <div className="px-6 py-4 space-y-6">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">🤖 About API Keys</h3>
            <p className="text-sm text-blue-800 mb-2">
              Add your AI service API keys to enable automatic code generation and AI-powered features.
              Your keys are encrypted and stored securely.
            </p>
            <p className="text-xs text-blue-700">
              Don't have an API key? Click on the service name below to sign up.
            </p>
          </div>

          {/* Add New Key Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-4">Add New API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select AI Service *
                </label>
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                           focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Choose a service...</option>
                  {services.map((service) => (
                    <option key={service.service_type} value={service.service_type}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedService && (
                <>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    {(() => {
                      const serviceInfo = getServiceInfo(selectedService);
                      return serviceInfo ? (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-700">{serviceInfo.description}</p>
                          <div className="flex gap-3 text-xs">
                            <a
                              href={serviceInfo.signup_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Sign Up →
                            </a>
                            <a
                              href={serviceInfo.docs_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline"
                            >
                              Documentation →
                            </a>
                          </div>
                          <p className="text-xs text-gray-500 mt-2">
                            Expected format: <code className="bg-gray-200 px-1 rounded">{serviceInfo.key_format}</code>
                          </p>
                        </div>
                      ) : null;
                    })()}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      API Key *
                    </label>
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="Enter your API key..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 
                               focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">{success}</p>
                </div>
              )}

              <button
                onClick={handleAddKey}
                disabled={loading || !selectedService || !apiKeyInput.trim()}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 
                         transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Adding...' : 'Add API Key'}
              </button>
            </div>
          </div>

          {/* Existing Keys Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Your API Keys</h3>
            
            {apiKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No API keys added yet</p>
                <p className="text-sm mt-1">Add your first API key above to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {apiKeys.map((key) => {
                  const serviceInfo = getServiceInfo(key.service_type);
                  return (
                    <div
                      key={key.id}
                      className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-semibold text-gray-900">{key.service_name}</h4>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            key.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {key.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Added: {new Date(key.created_at).toLocaleDateString()}</p>
                          {key.last_used_at && (
                            <p>Last used: {new Date(key.last_used_at).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleActive(key.id, key.is_active)}
                          className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                            key.is_active
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {key.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteKey(key.id)}
                          className="px-3 py-1.5 bg-red-100 text-red-700 rounded text-sm font-medium 
                                   hover:bg-red-200 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 
                     transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Made with Bob