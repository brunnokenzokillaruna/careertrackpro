'use client';

import React, { useState, useEffect, Fragment } from 'react';
import { supabase } from '@/lib/supabase/client';
import { JobApplication } from '@/lib/types';
import toast from 'react-hot-toast';
import GenerateDocsConfirmModal from './GenerateDocsConfirmModal';
import GenerateDocsModal from './GenerateDocsModal';
import { Transition } from '@headlessui/react';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplicationAdded: () => void;
  application?: JobApplication;
}

export default function ApplicationModal({ isOpen, onClose, onApplicationAdded, application }: ApplicationModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    status: 'Applied',
    applied_date: new Date().toISOString().split('T')[0],
    notes: '',
    job_url: '',
    platform: '',
  });
  const [showGenerateDocsConfirmModal, setShowGenerateDocsConfirmModal] = useState(false);
  const [showGenerateDocsModal, setShowGenerateDocsModal] = useState(false);
  const [newApplication, setNewApplication] = useState<JobApplication | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [documentLanguage, setDocumentLanguage] = useState('english');

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company || '',
        position: application.position || '',
        status: application.status || 'Applied',
        applied_date: new Date(application.applied_date).toISOString().split('T')[0],
        notes: application.notes || '',
        job_url: application.job_url || '',
        platform: application.platform || '',
      });
    } else {
      // Reset form for new application
      setFormData({
        company: '',
        position: '',
        status: 'Applied',
        applied_date: new Date().toISOString().split('T')[0],
        notes: '',
        job_url: '',
        platform: '',
      });
    }
  }, [application, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get authenticated user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!user) throw new Error('Not authenticated');

      // Format the application data
      const applicationData = {
        user_id: user.id,
        company: formData.company.trim(),
        position: formData.position.trim(),
        status: formData.status,
        applied_date: formData.applied_date,
        notes: formData.notes?.trim() || null,
        job_url: formData.job_url?.trim() || null,
        platform: formData.platform?.trim() || null,
      };

      // First, ensure user profile exists
      const { data: existingProfile, error: profileError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error checking user profile:', profileError);
        throw new Error('Failed to check user profile');
      }

      if (!existingProfile) {
        // Create user profile
        const { error: createError } = await supabase
          .from('users')
          .upsert([
            {
              id: user.id,
              email: user.email,
              name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
              created_at: new Date().toISOString(),
            }
          ], {
            onConflict: 'id'
          });

        if (createError) {
          console.error('Error creating user profile:', createError);
          throw new Error(createError.message);
        }
      }

      // Now handle the job application
      if (application) {
        // Update existing application
        const { data, error } = await supabase
          .from('job_applications')
          .update(applicationData)
          .eq('id', application.id)
          .select()
          .single();

        if (error) {
          console.error('Update error:', error);
          throw new Error(error.message);
        }

        if (!data) {
          throw new Error('Failed to update application');
        }

        toast.success('Application updated successfully!');
        onApplicationAdded();
        onClose();
      } else {
        // Create new application
        const { data, error } = await supabase
          .from('job_applications')
          .insert([applicationData])
          .select()
          .single();

        if (error) {
          console.error('Insert error:', error);
          throw new Error(error.message);
        }

        if (!data) {
          throw new Error('Failed to create application');
        }

        toast.success('Application added successfully!');
        
        // Store the new application for document generation
        setNewApplication(data);
        
        // Show the generate documents confirmation modal
        setShowGenerateDocsConfirmModal(true);
        
        // Call the callback
        onApplicationAdded();
      }
    } catch (error: any) {
      console.error('Error saving application:', error);
      toast.error(error.message || 'Failed to save application');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      if (!application) return;

      // First, delete any associated interviews
      const { error: interviewDeleteError } = await supabase
        .from('interviews')
        .delete()
        .eq('application_id', application.id);

      if (interviewDeleteError) throw interviewDeleteError;

      // Then delete the application
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', application.id);

      if (error) throw error;
      toast.success('Application deleted successfully');
      onClose();
    } catch (error) {
      console.error('Error deleting application:', error);
      toast.error('Failed to delete application');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateConfirm = (jobDescription: string, language: string) => {
    setJobDescription(jobDescription);
    setDocumentLanguage(language);
    setShowGenerateDocsConfirmModal(false);
    setShowGenerateDocsModal(true);
  };

  const handleCloseGenerateModal = () => {
    setShowGenerateDocsModal(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Transition.Root show={isOpen} as="div">
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-screen items-center justify-center px-4">
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

          {/* Modal */}
          <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-xl font-semibold text-gray-900">
              {application ? 'Edit Application' : 'Add New Application'}
            </h2>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                  Company
                </label>
                <input
                  type="text"
                  id="company"
                  required
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                  Position
                </label>
                <input
                  type="text"
                  id="position"
                  required
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as JobApplication['status'] })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                >
                  <option value="Applied">Applied</option>
                  <option value="Interviewing">Interviewing</option>
                  <option value="Offer">Offer</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label htmlFor="applied_date" className="block text-sm font-medium text-gray-700">
                  Applied Date
                </label>
                <input
                  type="date"
                  id="applied_date"
                  required
                  value={formData.applied_date}
                  onChange={(e) => setFormData({ ...formData, applied_date: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="job_url" className="block text-sm font-medium text-gray-700">
                  Job URL
                </label>
                <input
                  type="url"
                  id="job_url"
                  value={formData.job_url}
                  onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div>
                <label htmlFor="platform" className="block text-sm font-medium text-gray-700">
                  Platform
                </label>
                <input
                  type="text"
                  id="platform"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                  placeholder="e.g., LinkedIn, Indeed, Company Website"
                />
              </div>

              <div>
                <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  id="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500"
                />
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : application ? 'Update Application' : 'Add Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Generate Documents Confirmation Modal */}
      {showGenerateDocsConfirmModal && newApplication && (
        <GenerateDocsConfirmModal
          isOpen={showGenerateDocsConfirmModal}
          onClose={() => setShowGenerateDocsConfirmModal(false)}
          onConfirm={handleGenerateConfirm}
          application={newApplication}
        />
      )}

      {/* Generate Documents Modal */}
      {showGenerateDocsModal && (newApplication || application) && (
        <GenerateDocsModal
          isOpen={showGenerateDocsModal}
          onClose={handleCloseGenerateModal}
          application={newApplication || application!}
          initialJobDescription={jobDescription}
          language={documentLanguage}
        />
      )}
    </Transition.Root>
  );
} 