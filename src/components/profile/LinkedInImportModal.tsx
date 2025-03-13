import React from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import LinkedInImport from './LinkedInImport';
import { ProfileData } from '@/types/profile';

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (data: Partial<ProfileData>) => void;
}

const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog 
        as="div" 
        className="relative z-50" 
        onClose={onClose}
        initialFocus={undefined}
      >
        <Transition.Child
          as={Fragment}
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
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="bg-teal-50 -m-6 p-6 mb-6 border-b border-teal-100">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-teal-800 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    Import LinkedIn Data
                  </Dialog.Title>
                  <p className="mt-2 text-sm text-teal-600">
                    Import your profile information directly from LinkedIn data export.
                  </p>
                </div>

                <div className="mb-6">
                  <LinkedInImport 
                    onImportComplete={(data) => {
                      onImportComplete(data);
                      onClose();
                    }} 
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How to get your LinkedIn data:
                  </h4>
                  <ol className="mt-2 text-sm text-gray-600 list-decimal list-inside space-y-1 ml-2">
                    <li>Go to your LinkedIn account settings</li>
                    <li>Click on "Data privacy"</li>
                    <li>Select "Get a copy of your data"</li>
                    <li>Request "The works" or select specific data (make sure to include profile, positions, education, skills, etc.)</li>
                    <li>Wait for LinkedIn to prepare your data (up to 24 hours)</li>
                    <li>Download the archive when it's ready</li>
                    <li>Upload the zip file directly using the button above</li>
                  </ol>
                  <p className="mt-2 text-xs text-gray-500 italic">You can also extract the zip file and upload individual CSV files if you prefer.</p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 transition-colors"
                    onClick={onClose}
                  >
                    Close
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default LinkedInImportModal; 