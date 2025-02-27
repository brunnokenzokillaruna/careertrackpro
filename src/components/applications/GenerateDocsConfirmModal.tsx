import React, { useState, Fragment } from 'react';
import { JobApplication } from '@/lib/types';
import { Dialog, Transition } from '@headlessui/react';

interface GenerateDocsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (jobDescription: string, language: string) => void;
  application: JobApplication;
}

export default function GenerateDocsConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  application,
}: GenerateDocsConfirmModalProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [language, setLanguage] = useState('english');
  
  const handleConfirm = () => {
    onConfirm(jobDescription, language);
  };

  // Helper function to safely render content that might be an object
  const safeRender = (content: any): string => {
    if (typeof content === 'object' && content !== null) {
      return JSON.stringify(content);
    }
    return String(content || '');
  };

  return (
    <Transition appear show={isOpen} as="div">
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  Generate Documents for {safeRender(application.position)} at {safeRender(application.company)}
                </Dialog.Title>
                <p className="mt-2 text-sm text-gray-500">
                  Please provide the job description to tailor your resume and cover letter.
                </p>

                <div className="mt-4">
                  <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Copy and paste the job description to generate tailored documents.
                  </p>
                  <textarea
                    id="jobDescription"
                    name="jobDescription"
                    rows={6}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Paste job description here..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                    Document Language
                  </label>
                  <p className="text-xs text-gray-500 mb-2">
                    Select the language for your resume and cover letter.
                  </p>
                  <select
                    id="language"
                    name="language"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    <option value="english">English</option>
                    <option value="french">French (Français)</option>
                    <option value="portuguese">Portuguese (Português)</option>
                    <option value="spanish">Spanish (Español)</option>
                    <option value="german">German (Deutsch)</option>
                    <option value="chinese">Chinese (中文)</option>
                    <option value="japanese">Japanese (日本語)</option>
                  </select>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium leading-4 text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-teal-600 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    onClick={handleConfirm}
                  >
                    Generate
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
} 