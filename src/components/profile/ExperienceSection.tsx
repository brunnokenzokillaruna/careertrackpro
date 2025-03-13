import React from 'react';
import { PlusIcon, TrashIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { ProfileData, ExperienceItem } from '@/types/profile';

interface ExperienceSectionProps {
  profileData: ProfileData;
  handleStructuredChange: (field: keyof ProfileData, index: number, property: string, value: string) => void;
  handleRemoveArrayItem: (field: keyof ProfileData, index: number) => void;
  handleAddArrayItem: (field: keyof ProfileData) => void;
}

const ExperienceSection: React.FC<ExperienceSectionProps> = ({
  profileData,
  handleStructuredChange,
  handleRemoveArrayItem,
  handleAddArrayItem
}) => {
  const renderExperienceItem = (experience: ExperienceItem, index: number) => {
    return (
      <div key={index} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <BriefcaseIcon className="h-6 w-6 text-teal-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Experience #{index + 1}</h4>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('experience', index)}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Company Name"
              value={experience.company || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'company', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Position
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Job Title"
              value={experience.position || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'position', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location (Optional)
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="City, Country"
              value={experience.location || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'location', e.target.value)}
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
                value={experience.startDate || ''}
                onChange={(e) => handleStructuredChange('experience', index, 'startDate', e.target.value)}
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
                value={experience.endDate || ''}
                onChange={(e) => handleStructuredChange('experience', index, 'endDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technologies & Programming Languages
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="e.g., JavaScript, React, Node.js, Python (comma separated)"
              value={experience.technologies || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'technologies', e.target.value)}
            />
            <p className="mt-1 text-xs text-gray-500">
              List the technologies and programming languages used in this role. This will be used to calculate your years of experience with each technology.
            </p>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows={4}
              placeholder="Describe your responsibilities, achievements, and the projects you worked on"
              value={experience.description || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'description', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
        <button
          type="button"
          onClick={() => handleAddArrayItem('experience')}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Experience
        </button>
      </div>
      
      {profileData.experience.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No work experience entries yet. Add your professional experience.</p>
      ) : (
        profileData.experience.map((experience, index) => renderExperienceItem(experience, index))
      )}
    </div>
  );
};

export default ExperienceSection; 