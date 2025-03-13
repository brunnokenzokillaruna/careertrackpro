import React from 'react';
import { PlusIcon, TrashIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { ProfileData, CertificationItem } from '@/types/profile';

interface CertificationsSectionProps {
  profileData: ProfileData;
  handleStructuredChange: (field: keyof ProfileData, index: number, property: string, value: string) => void;
  handleRemoveArrayItem: (field: keyof ProfileData, index: number) => void;
  handleAddArrayItem: (field: keyof ProfileData) => void;
}

const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  profileData,
  handleStructuredChange,
  handleRemoveArrayItem,
  handleAddArrayItem
}) => {
  const renderCertificationItem = (certification: CertificationItem, index: number) => {
    return (
      <div key={index} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-6 w-6 text-teal-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Certification #{index + 1}</h4>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('certifications', index)}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certification Name
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Certification Name"
              value={certification.name || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'name', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuing Organization
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Organization Name"
              value={certification.issuer || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'issuer', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="MM/YYYY"
              value={certification.date || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'date', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              URL (Optional)
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="https://..."
              value={certification.url || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'url', e.target.value)}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows={2}
              placeholder="Additional information about the certification"
              value={certification.description || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'description', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
        <button
          type="button"
          onClick={() => handleAddArrayItem('certifications')}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Certification
        </button>
      </div>
      
      {profileData.certifications.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No certifications added yet. Add your professional certifications.</p>
      ) : (
        profileData.certifications.map((certification, index) => renderCertificationItem(certification, index))
      )}
    </div>
  );
};

export default CertificationsSection; 