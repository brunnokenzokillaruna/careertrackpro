import React from 'react';
import { UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import { ProfileData } from '@/types/profile';

interface ProfileHeaderProps {
  profileData: ProfileData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  renderTextField: (name: string, label: string, placeholder: string, icon: React.ReactNode) => JSX.Element;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ 
  profileData, 
  handleChange,
  renderTextField
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderTextField('fullName', 'Full Name', 'Your full name', <UserIcon className="h-5 w-5 text-gray-400" />)}
          {renderTextField('email', 'Email', 'Your email address', <EnvelopeIcon className="h-5 w-5 text-gray-400" />)}
          {renderTextField('phone', 'Phone', 'Your phone number', <PhoneIcon className="h-5 w-5 text-gray-400" />)}
          {renderTextField('location', 'Location', 'City, Country', <MapPinIcon className="h-5 w-5 text-gray-400" />)}
          {renderTextField('website', 'Website', 'Your personal website', <GlobeAltIcon className="h-5 w-5 text-gray-400" />)}
          {renderTextField('linkedin', 'LinkedIn', 'Your LinkedIn profile URL', 
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          )}
          {renderTextField('github', 'GitHub', 'Your GitHub profile URL', 
            <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
          )}
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Summary</h3>
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            id="summary"
            name="summary"
            rows={4}
            className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
            placeholder="Write a professional summary about yourself"
            value={profileData.summary}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 