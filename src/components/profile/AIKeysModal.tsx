import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

interface AIKey {
  id: number;
  name: string;
  key: string;
}

interface AIKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  onKeyAdded?: (newKey: AIKey) => void;
  onKeysUpdated?: () => Promise<void>;
  aiKeys?: AIKey[];
}

const AIKeysModal: React.FC<AIKeysModalProps> = ({ 
  isOpen, 
  onClose, 
  onKeyAdded, 
  onKeysUpdated,
  aiKeys = []
}) => {
  const { user: contextUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    key: '',
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Fetch the current user directly from Supabase
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data && data.user) {
        setCurrentUser(data.user);
      }
    };
    
    if (isOpen) {
      fetchCurrentUser();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.key.trim()) {
      toast.error('Please provide both a name and API key.');
      return;
    }

    // Get the current user directly from Supabase
    const { data: userData } = await supabase.auth.getUser();
    const user = userData?.user;
    
    if (!user || !user.id) {
      toast.error('You must be logged in to add an API key.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Insert the key with the authenticated user
      const { data, error } = await supabase
        .from('ai_keys')
        .insert({
          user_id: user.id,
          name: formData.name,
          key: formData.key,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Your API key has been added successfully.');

      // Reset form
      setFormData({
        name: '',
        key: '',
      });

      // Notify parent component
      if (onKeyAdded) onKeyAdded(data);
      if (onKeysUpdated) await onKeysUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error adding API key:', error);
      toast.error(`Error adding API key: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Add API Key</h3>
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="e.g., OpenAI, Anthropic, etc."
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-gray-700">
                  API Key
                </label>
                <input
                  type="password"
                  name="key"
                  id="key"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                  placeholder="Enter your API key"
                  value={formData.key}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Adding...' : 'Add Key'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIKeysModal; 