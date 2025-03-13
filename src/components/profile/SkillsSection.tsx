import React from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ProfileData } from '@/types/profile';

interface SkillsSectionProps {
  profileData: ProfileData;
  handleRemoveArrayItem: (field: keyof ProfileData, index: number) => void;
  handleAddSimpleItem: (field: keyof Pick<ProfileData, 'skills' | 'languages'>) => void;
  inputValues: Record<string, string>;
  setInputValues: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  inputErrors: Record<string, string>;
  setInputErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  getExperienceYearsForSkill?: (skill: string) => number;
}

const SkillsSection: React.FC<SkillsSectionProps> = ({
  profileData,
  handleRemoveArrayItem,
  handleAddSimpleItem,
  inputValues,
  setInputValues,
  inputErrors,
  setInputErrors,
  getExperienceYearsForSkill
}) => {
  const handleInputChange = (field: string, value: string) => {
    setInputValues(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (inputErrors[field]) {
      setInputErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const renderSkillItem = (skill: string, index: number) => {
    const experienceYears = getExperienceYearsForSkill ? getExperienceYearsForSkill(skill) : null;
    
    return (
      <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md mb-2">
        <div className="flex items-center">
          <span className="text-gray-800">{skill}</span>
          {experienceYears !== null && experienceYears > 0 && (
            <span className="ml-2 text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full">
              {experienceYears} {experienceYears === 1 ? 'year' : 'years'}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => handleRemoveArrayItem('skills', index)}
          className="text-red-500 hover:text-red-700"
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const renderLanguageItem = (language: string, index: number) => (
    <div key={index} className="flex items-center justify-between bg-gray-50 px-4 py-2 rounded-md mb-2">
      <span className="text-gray-800">{language}</span>
      <button
        type="button"
        onClick={() => handleRemoveArrayItem('languages', index)}
        className="text-red-500 hover:text-red-700"
      >
        <TrashIcon className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Skills Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Skills</h3>
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              className={`shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                inputErrors.skills ? 'border-red-500' : ''
              }`}
              placeholder="Add a skill"
              value={inputValues.skills || ''}
              onChange={(e) => handleInputChange('skills', e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSimpleItem('skills');
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddSimpleItem('skills')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          {inputErrors.skills && (
            <p className="mt-1 text-sm text-red-500">{inputErrors.skills}</p>
          )}
        </div>
        {profileData.skills.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No skills added yet. Add your professional skills.</p>
        ) : (
          <div className="space-y-2">
            {profileData.skills.map((skill, index) => renderSkillItem(skill, index))}
          </div>
        )}
      </div>

      {/* Languages Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Languages</h3>
        <div className="mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              className={`shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md ${
                inputErrors.languages ? 'border-red-500' : ''
              }`}
              placeholder="Add a language"
              value={inputValues.languages || ''}
              onChange={(e) => handleInputChange('languages', e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSimpleItem('languages');
                }
              }}
            />
            <button
              type="button"
              onClick={() => handleAddSimpleItem('languages')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <PlusIcon className="h-4 w-4" />
            </button>
          </div>
          {inputErrors.languages && (
            <p className="mt-1 text-sm text-red-500">{inputErrors.languages}</p>
          )}
        </div>
        {profileData.languages.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No languages added yet. Add languages you know.</p>
        ) : (
          <div className="space-y-2">
            {profileData.languages.map((language, index) => renderLanguageItem(language, index))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsSection; 