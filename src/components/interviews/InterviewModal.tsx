import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Interview, JobApplication } from '@/lib/types';
import toast from 'react-hot-toast';
import { TrashIcon } from '@heroicons/react/24/outline';

interface InterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInterviewAdded: () => void;
  interview?: Interview;
  selectedDate?: Date;
}

export default function InterviewModal({
  isOpen,
  onClose,
  onInterviewAdded,
  interview,
  selectedDate,
}: InterviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [formData, setFormData] = useState({
    application_id: '',
    interview_date: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    if (isOpen) {
      loadApplications();
      if (interview) {
        setFormData({
          application_id: String(interview.application_id),
          interview_date: new Date(interview.interview_date).toISOString().slice(0, 16),
          location: interview.location || '',
          notes: interview.notes || '',
        });
      } else if (selectedDate) {
        setFormData(prev => ({
          ...prev,
          interview_date: selectedDate.toISOString().slice(0, 16),
        }));
      } else {
        setFormData({
          application_id: '',
          interview_date: new Date().toISOString().slice(0, 16),
          location: '',
          notes: '',
        });
      }
    }
  }, [isOpen, interview, selectedDate]);

  const loadApplications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['Applied', 'Interviewing'])
        .order('company', { ascending: true });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error loading applications:', error);
      toast.error('Failed to load applications');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const interviewData = {
        application_id: parseInt(formData.application_id),
        user_id: user.id,
        interview_date: new Date(formData.interview_date).toISOString(),
        location: formData.location.trim() || null,
        notes: formData.notes.trim() || null,
      };

      // Update the application status to 'Interviewing'
      const { error: updateError } = await supabase
        .from('job_applications')
        .update({ status: 'Interviewing' })
        .eq('id', formData.application_id);

      if (updateError) throw updateError;

      if (interview?.id) {
        // Update existing interview
        const { error } = await supabase
          .from('interviews')
          .update(interviewData)
          .eq('id', interview.id);

        if (error) throw error;
        toast.success('Interview updated successfully');
      } else {
        // Create new interview
        const { error } = await supabase
          .from('interviews')
          .insert([interviewData]);

        if (error) throw error;
        toast.success('Interview scheduled successfully');
      }

      onInterviewAdded();
      onClose();
    } catch (error: any) {
      console.error('Error saving interview:', error);
      toast.error(error.message || 'Failed to save interview');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (!interview?.id) return;

      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interview.id);

      if (error) throw error;

      toast.success('Interview deleted successfully');
      onInterviewAdded();
      onClose();
    } catch (error: any) {
      console.error('Error deleting interview:', error);
      toast.error(error.message || 'Failed to delete interview');
    } finally {
      setLoading(false);
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
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {interview ? 'Edit Interview' : 'Schedule Interview'}
            </h2>
            {interview && (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-600 hover:text-red-700"
                disabled={loading}
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </div>

          {showDeleteConfirm ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">
                Are you sure you want to delete this interview? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="application_id" className="block text-sm font-medium text-gray-700">
                  Application
                </label>
                <select
                  id="application_id"
                  value={formData.application_id}
                  onChange={(e) => setFormData({ ...formData, application_id: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="">Select an application</option>
                  {applications.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.company} - {app.position}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="interview_date" className="block text-sm font-medium text-gray-700">
                  Interview Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="interview_date"
                  value={formData.interview_date}
                  onChange={(e) => setFormData({ ...formData, interview_date: e.target.value })}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Office address or virtual meeting link"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  placeholder="Any additional notes about the interview"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
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
                  disabled={loading}
                  className="rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : interview ? 'Update Interview' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
} 