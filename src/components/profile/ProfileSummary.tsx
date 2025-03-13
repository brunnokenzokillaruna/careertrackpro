import React from 'react';
import { ProfileData } from '@/types/profile';

interface ProfileSummaryProps {
  profileData: ProfileData;
  calculateTotalExperienceYears: () => { years: number; months: number };
  getExperienceYearsForSkill: (skill: string) => number;
}

const ProfileSummary: React.FC<ProfileSummaryProps> = ({
  profileData,
  calculateTotalExperienceYears,
  getExperienceYearsForSkill
}) => {
  const renderExperienceSummary = () => {
    if (profileData.experience.length === 0) {
      return (
        <div className="text-center py-4">
          <p className="text-gray-500">No experience data available.</p>
          <p className="text-sm text-gray-400 mt-1">
            Add work experience to see your experience summary.
          </p>
        </div>
      );
    }

    const topSkills = [...profileData.skills]
      .sort((a, b) => getExperienceYearsForSkill(b) - getExperienceYearsForSkill(a))
      .slice(0, 5);

    return (
      <div className="space-y-4">
        {topSkills.length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-2">Top Skills by Experience</h4>
            <div className="space-y-2">
              {topSkills.map((skill, index) => {
                const years = getExperienceYearsForSkill(skill);
                if (years <= 0) return null;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-800">{skill}</span>
                    <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      {years} {years === 1 ? 'year' : 'years'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-md font-medium text-gray-700 mb-2">Recent Positions</h4>
          <div className="space-y-3">
            {profileData.experience.slice(0, 3).map((exp, index) => (
              <div key={index} className="border-l-2 border-blue-500 pl-3">
                <div className="font-medium text-gray-800">{exp.position}</div>
                <div className="text-sm text-gray-600">{exp.company}</div>
                <div className="text-xs text-gray-500">
                  {exp.startDate} - {exp.endDate}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Experience Summary</h3>
      {renderExperienceSummary()}
    </div>
  );
};

export default ProfileSummary; 