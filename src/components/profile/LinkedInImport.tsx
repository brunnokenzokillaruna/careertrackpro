import React, { useState, useRef } from 'react';
import { processLinkedinFiles } from '@/utils/linkedinImport';
import { ProfileData } from '@/types/profile';
import toast from 'react-hot-toast';

interface LinkedInImportProps {
  onImportComplete: (data: Partial<ProfileData>) => void;
}

const LinkedInImport: React.FC<LinkedInImportProps> = ({ onImportComplete }) => {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsImporting(true);
    try {
      toast.loading('Processing LinkedIn data...', { id: 'linkedin-import' });
      
      // Process the LinkedIn files
      const profileData = await processLinkedinFiles(files);

      // Notify parent component of the imported data
      onImportComplete(profileData);
      
      toast.success('LinkedIn data imported successfully!', { id: 'linkedin-import' });
    } catch (error) {
      console.error('Error importing LinkedIn data:', error);
      toast.error('Failed to import LinkedIn data. Please try again.', { id: 'linkedin-import' });
    } finally {
      setIsImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImportClick = () => {
    // Trigger file input click
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".zip,.csv"
        multiple
        className="hidden"
        disabled={isImporting}
      />
      <div className="w-full p-4 text-center">
        <button
          type="button"
          onClick={handleImportClick}
          disabled={isImporting}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          {isImporting ? 'Importing...' : 'Select LinkedIn Data File'}
        </button>
      </div>
    </div>
  );
};

export default LinkedInImport; 