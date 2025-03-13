import React, { useEffect, useState } from 'react';
import { DocumentPreviewProps } from '../types';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import { generatePDF } from '../utils/pdfUtils';

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  type,
  isGenerating,
  onDownload
}) => {
  const [cleanedContent, setCleanedContent] = useState<string>('');
  
  useEffect(() => {
    if (content) {
      // Process the content when it changes
      const processed = processContent(content);
      setCleanedContent(processed);
    } else {
      setCleanedContent('');
    }
  }, [content]);
  
  // Process content by completely rebuilding it from scratch
  const processContent = (rawContent: string): string => {
    if (!rawContent) return '';
    
    try {
      // Split into lines and process each line
      const lines = rawContent.split('\n');
      const processedLines = [];
      
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        
        // Skip markdown markers and empty lines
        if (line === '```markdown' || line === '```' || line === 'markdown') {
          continue;
        }
        
        // Skip lines with just # markers
        if (/^#+\s*$/.test(line)) {
          continue;
        }
        
        // Remove heading markers
        line = line.replace(/^#+\s+/, '');
        
        // Remove bold/italic markers
        line = line.replace(/\*\*([^*]+)\*\*/g, '$1');
        line = line.replace(/\*([^*]+)\*/g, '$1');
        
        // Remove bullet points
        line = line.replace(/^\s*[\*\-]\s+/, '');
        
        // Remove numbered list markers
        line = line.replace(/^\s*\d+\.\s+/, '');
        
        // Remove brackets and parentheses around URLs
        line = line.replace(/\[(.*?)\]\((.*?)\)/g, '$1');
        
        // Add the processed line if it's not empty
        if (line.trim()) {
          processedLines.push(line);
        }
      }
      
      return processedLines.join('\n');
    } catch (error) {
      console.error('Error processing content:', error);
      return rawContent; // Return original content if processing fails
    }
  };

  // Handle download button click
  const handleDownload = () => {
    generatePDF(content, type);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          {type === 'resume' ? 'Resume' : 'Cover Letter'} Preview
        </h3>
        {content && !isGenerating && (
          <button
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <DocumentTextIcon className="-ml-0.5 mr-2 h-4 w-4" aria-hidden="true" />
            Download PDF
          </button>
        )}
      </div>

      <div className="relative">
        {isGenerating && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-75">
            <div className="text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Generating {type === 'resume' ? 'Resume' : 'Cover Letter'}...</h3>
            </div>
          </div>
        )}

        <div className={`bg-white shadow sm:rounded-lg ${isGenerating ? 'opacity-50' : ''}`}>
          <div className="px-4 py-5 sm:p-6">
            {cleanedContent ? (
              <div className="font-sans text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {cleanedContent}
              </div>
            ) : (
              <div className="text-center text-gray-500">
                <DocumentTextIcon className="mx-auto h-12 w-12" aria-hidden="true" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No content generated yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Fill in the form and click generate to create your {type === 'resume' ? 'resume' : 'cover letter'}.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 