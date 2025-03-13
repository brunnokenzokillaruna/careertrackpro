import React from 'react';
import { PlusIcon, TrashIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { ProfileData, ProjectItem } from '@/types/profile';

interface ProjectsSectionProps {
  profileData: ProfileData;
  handleStructuredChange: (field: keyof ProfileData, index: number, property: string, value: string) => void;
  handleRemoveArrayItem: (field: keyof ProfileData, index: number) => void;
  handleAddArrayItem: (field: keyof ProfileData) => void;
}

const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  profileData,
  handleStructuredChange,
  handleRemoveArrayItem,
  handleAddArrayItem
}) => {
  const renderProjectItem = (project: ProjectItem, index: number) => {
    return (
      <div key={index} className="bg-white shadow rounded-lg p-6 mb-4">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center">
            <DocumentTextIcon className="h-6 w-6 text-teal-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-900">Project #{index + 1}</h4>
          </div>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('projects', index)}
            className="text-red-500 hover:text-red-700"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project Name
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Project Name"
              value={project.name || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'name', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technologies Used
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Technologies, frameworks, languages"
              value={project.technologies || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'technologies', e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project URL (Optional)
            </label>
            <input
              type="text"
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="https://..."
              value={project.url || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'url', e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date (Optional)
              </label>
              <input
                type="text"
                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="MM/YYYY"
                value={project.startDate || ''}
                onChange={(e) => handleStructuredChange('projects', index, 'startDate', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <input
                type="text"
                className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="MM/YYYY or Present"
                value={project.endDate || ''}
                onChange={(e) => handleStructuredChange('projects', index, 'endDate', e.target.value)}
              />
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              className="shadow-sm focus:ring-teal-500 focus:border-teal-500 block w-full sm:text-sm border-gray-300 rounded-md"
              rows={3}
              placeholder="Describe the project, your role, and achievements"
              value={project.description || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'description', e.target.value)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Projects</h3>
        <button
          type="button"
          onClick={() => handleAddArrayItem('projects')}
          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          <PlusIcon className="h-4 w-4 mr-1" />
          Add Project
        </button>
      </div>
      
      {profileData.projects.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No projects added yet. Add your personal or professional projects.</p>
      ) : (
        profileData.projects.map((project, index) => renderProjectItem(project, index))
      )}
    </div>
  );
};

export default ProjectsSection; 