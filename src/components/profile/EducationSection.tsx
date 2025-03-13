import React from 'react';
import { PlusIcon, TrashIcon, PencilIcon, AcademicCapIcon } from '@heroicons/react/24/outline';
import { ProfileData, EducationItem } from '@/types/profile';

interface EducationSectionProps {
  profileData: ProfileData;
  handleStructuredChange: (field: keyof ProfileData, index: number, property: string, value: string) => void;
  handleRemoveArrayItem: (field: keyof ProfileData, index: number) => void;
  handleAddArrayItem: (field: keyof ProfileData) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({
  profileData,
  handleStructuredChange,
  handleRemoveArrayItem,
  handleAddArrayItem
}) => {
  const renderEducationItem = (education: EducationItem, index: number) => {
    return (
      <div key={index} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <AcademicCapIcon className="h-6 w-6 text-teal-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Education #{index + 1}</h4>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('education', index)}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Institution
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="University or School Name"
              value={education.institution || ''}
              onChange={(e) => handleStructuredChange('education', index, 'institution', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Degree
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Bachelor's, Master's, etc."
              value={education.degree || ''}
              onChange={(e) => handleStructuredChange('education', index, 'degree', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Field of Study
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Computer Science, Business, etc."
              value={education.field || ''}
              onChange={(e) => handleStructuredChange('education', index, 'field', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="text"
                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="MM/YYYY"
                value={education.startDate || ''}
                onChange={(e) => handleStructuredChange('education', index, 'startDate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="text"
                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="MM/YYYY or Present"
                value={education.endDate || ''}
                onChange={(e) => handleStructuredChange('education', index, 'endDate', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Education</h3>
        <button
          type="button"
          onClick={() => handleAddArrayItem('education')}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Education
        </button>
      </div>
      
      {profileData.education.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No education entries yet. Add your educational background.</p>
      ) : (
        profileData.education.map((education, index) => renderEducationItem(education, index))
      )}
    </div>
  );
};

export default EducationSection; 