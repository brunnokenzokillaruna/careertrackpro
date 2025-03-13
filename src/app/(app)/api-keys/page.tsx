'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { KeyIcon, TrashIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { AIKey } from '@/types/profile';

export default function APIKeysPage() {
  const [loading, setLoading] = useState(true);
  const [aiKeys, setAiKeys] = useState<AIKey[]>([]);
  const [defaultApiKeyId, setDefaultApiKeyId] = useState<number | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [testingKey, setTestingKey] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string }>>({});

  useEffect(() => {
    loadAIKeys();
    loadDefaultApiKey();
  }, []);

  const loadAIKeys = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to view your API keys');
        return;
      }

      const { data, error } = await supabase
        .from('ai_keys')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setAiKeys(data || []);
    } catch (error) {
      console.error('Error loading AI keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const loadDefaultApiKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_settings')
        .select('default_api_key_id')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.default_api_key_id) {
        setDefaultApiKeyId(data.default_api_key_id);
      }
    } catch (error) {
      console.error('Error loading default API key:', error);
    }
  };

  const updateDefaultApiKey = async (keyId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if a settings record exists
      const { data: existingSettings, error: checkError } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let updateError;
      if (existingSettings) {
        // Update existing record
        const { error } = await supabase
          .from('user_settings')
          .update({ default_api_key_id: keyId })
          .eq('user_id', user.id);
        updateError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('user_settings')
          .insert({ user_id: user.id, default_api_key_id: keyId });
        updateError = error;
      }

      if (updateError) throw updateError;

      setDefaultApiKeyId(keyId);
      toast.success('Default API key updated');
    } catch (error) {
      console.error('Error updating default API key:', error);
      toast.error('Failed to update default API key');
    }
  };

  const handleAddApiKey = async () => {
    if (!newKeyName.trim() || !newApiKey.trim()) {
      toast.error('Please enter both a name and an API key');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_keys')
        .insert({
          user_id: user.id,
          name: newKeyName.trim(),
          key: newApiKey.trim()
        })
        .select()
        .single();

      if (error) throw error;

      // Add to state
      if (data) {
        setAiKeys(prev => [...prev, data]);
        
        // If this is the first key, set it as default
        if (aiKeys.length === 0) {
          await updateDefaultApiKey(data.id);
        }
        
        setNewKeyName('');
        setNewApiKey('');
        toast.success('API key added successfully');
      }
    } catch (error) {
      console.error('Error adding API key:', error);
      toast.error('Failed to add API key');
    }
  };

  const handleDeleteApiKey = async (keyId: number) => {
    try {
      const { error } = await supabase
        .from('ai_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      // Remove from state
      setAiKeys(prev => prev.filter(key => key.id !== keyId));

      // If this was the default key, clear the default
      if (defaultApiKeyId === keyId) {
        setDefaultApiKeyId(null);
        
        // Also update in database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase
            .from('user_settings')
            .update({ default_api_key_id: null })
            .eq('user_id', user.id);
        }
      }

      // Remove test results for this key
      setTestResults(prev => {
        const newResults = { ...prev };
        delete newResults[keyId];
        return newResults;
      });

      toast.success('API key deleted');
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  const testApiKey = async (keyId: number) => {
    const key = aiKeys.find(k => k.id === keyId);
    if (!key) {
      toast.error('API key not found');
      return;
    }

    setTestingKey(keyId);
    
    try {
      // Test if it's an OpenAI key
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ key: key.key }),
      });

      const data = await response.json();
      
      if (response.ok) {
        setTestResults(prev => ({
          ...prev,
          [keyId]: { success: true, message: `API key is valid (${data.provider})` }
        }));
        toast.success(`API key is valid (${data.provider})`);
      } else {
        setTestResults(prev => ({
          ...prev,
          [keyId]: { success: false, message: data.error || 'API key is invalid' }
        }));
        toast.error(data.error || 'API key is invalid');
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      setTestResults(prev => ({
        ...prev,
        [keyId]: { success: false, message: 'Error testing API key' }
      }));
      toast.error('Error testing API key');
    } finally {
      setTestingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">API Keys</h1>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Add New API Key</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-1">
              Key Name
            </label>
            <input
              id="keyName"
              type="text"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="e.g., OpenAI Key"
              value={newKeyName}
              onChange={(e) => setNewKeyName(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="sk-..."
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              Supported providers: OpenAI, Anthropic, Google AI (Gemini)
            </p>
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAddApiKey}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Key
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Your API Keys</h2>
        
        {aiKeys.length === 0 ? (
          <div className="text-center py-8">
            <KeyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No API keys</h3>
            <p className="mt-1 text-sm text-gray-500">
              Add an API key to use AI-powered features like document generation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {aiKeys.map((key) => (
              <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <KeyIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <div>
                      <div className="flex items-center">
                        <span className="font-medium text-gray-800">{key.name}</span>
                        {key.id === defaultApiKeyId && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        {key.key.substring(0, 5)}...{key.key.substring(key.key.length - 5)}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {key.id !== defaultApiKeyId && (
                      <button
                        type="button"
                        onClick={() => updateDefaultApiKey(key.id)}
                        className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                      >
                        Set Default
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => testApiKey(key.id)}
                      disabled={testingKey === key.id}
                      className={`text-xs ${
                        testingKey === key.id
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      } px-2 py-1 rounded`}
                    >
                      {testingKey === key.id ? 'Testing...' : 'Test'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteApiKey(key.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {testResults[key.id] && (
                  <div className={`mt-2 text-sm ${
                    testResults[key.id].success ? 'text-green-600' : 'text-red-600'
                  } flex items-center`}>
                    {testResults[key.id].success ? (
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                    ) : (
                      <XCircleIcon className="h-4 w-4 mr-1" />
                    )}
                    {testResults[key.id].message}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 