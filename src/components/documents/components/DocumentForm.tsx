import React from 'react';
import { DocumentFormProps } from '../types';

export const DocumentForm: React.FC<DocumentFormProps> = ({
  profile,
  jobDescription,
  onJobDescriptionChange,
  selectedKeyId,
  aiKeys,
  onKeySelect,
  onGenerate,
  isGenerating
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
          Job Description
        </label>
        <textarea
          id="jobDescription"
          rows={6}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          placeholder="Paste the job description here..."
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
          Select API Key
        </label>
        <select
          id="apiKey"
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={selectedKeyId || ''}
          onChange={(e) => onKeySelect(Number(e.target.value))}
        >
          <option value="">Select an API key</option>
          {aiKeys.map((key) => (
            <option key={key.id} value={key.id}>
              {key.name || key.id}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating || !profile}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white 
            ${isGenerating || !profile
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            }`}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating...
            </>
          ) : (
            'Generate Documents'
          )}
        </button>
      </div>
    </div>
  );
}; 