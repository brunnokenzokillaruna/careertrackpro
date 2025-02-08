import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { toast } from 'react-hot-toast';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationAdded: () => void;
  application?: any;
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  onApplicationAdded,
  application
}) => {
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    job_url: '',
    platform: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        position: application.position || '',
        status: application.status || 'Applied',
        applied_date: application.applied_date || new Date().toISOString().split('T')[0],
        job_url: application.job_url || '',
        platform: application.platform || '',
        notes: application.notes || '',
      });
    } else {
      setFormData({
        company: '',
        position: '',
        status: 'Applied',
        applied_date: new Date().toISOString().split('T')[0],
        job_url: '',
        platform: '',
        notes: '',
      });
    }
  }, [application]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      // Format the date to UTC
      const utcDate = new Date(formData.applied_date);
      utcDate.setMinutes(utcDate.getMinutes() - utcDate.getTimezoneOffset());
      
      const applicationData = {
        company: formData.company.trim(),
        position: formData.position.trim(),
        status: formData.status,
        applied_date: utcDate.toISOString().split('T')[0],
        job_url: formData.job_url?.trim() || null,
        platform: formData.platform?.trim() || null,
        notes: formData.notes?.trim() || null,
        user_id: user.id
      };

      if (application?.id) {
        // Update existing application
        const { error: updateError } = await supabase
          .from('job_applications')
          .update(applicationData)
          .eq('id', application.id)
          .select()
          .single();

        if (updateError) throw updateError;
        toast.success('Application updated successfully');
      } else {
        // Create new application
        const { error: insertError } = await supabase
          .from('job_applications')
          .insert(applicationData)
          .select()
          .single();

        if (insertError) throw insertError;
        toast.success('Application added successfully');
      }

      onApplicationAdded();
      onClose();
    } catch (error: any) {
      console.error('Error saving application:', error);
      toast.error(`Failed to save application: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {application ? 'Edit Application' : 'Add New Application'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Position</label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Applied Date</label>
              <input
                type="date"
                name="applied_date"
                value={formData.applied_date}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Job URL</label>
              <input
                type="url"
                name="job_url"
                value={formData.job_url}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Platform</label>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : application ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationModal; 