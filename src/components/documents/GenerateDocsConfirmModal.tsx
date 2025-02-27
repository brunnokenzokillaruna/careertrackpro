import React from 'react';

interface GenerateDocsConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  applicationTitle: string;
}

const GenerateDocsConfirmModal: React.FC<GenerateDocsConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  applicationTitle,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-lg bg-white p-6 shadow-xl transition-all">
          <div className="mb-4">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Generate Documents</h3>
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
            <p className="text-sm text-gray-700">
              Would you like to generate a resume and cover letter for your application to{' '}
              <strong>{applicationTitle}</strong>?
            </p>
            <p className="text-xs text-gray-500">
              This will use your profile information and AI to create tailored documents for this job application.
            </p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Not Now
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
            >
              Generate Documents
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateDocsConfirmModal; 