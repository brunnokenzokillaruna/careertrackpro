import React from 'react';
import { ProfileData, ExperienceItem } from '@/types/profile';
import { getExperienceYearsForSkill } from './utils/ProfileUtils';

interface TechnologyExperienceSectionProps {
  profileData: ProfileData;
}

interface TechExperience {
  name: string;
  years: number;
}

const TechnologyExperienceSection: React.FC<TechnologyExperienceSectionProps> = ({ profileData }) => {
  // Extract all technologies from experience entries
  const getAllTechnologies = (): string[] => {
    const techSet = new Set<string>();
    
    // Extract from technologies field in experience
    profileData.experience.forEach((exp: ExperienceItem) => {
      if (exp.technologies && exp.technologies.trim() !== '') {
        const techs = exp.technologies.split(',')
          .map((t: string) => t.trim())
          .filter(Boolean);
        
        techs.forEach((t: string) => techSet.add(t));
      }
    });
    
    // Don't include skills - only use technologies explicitly listed in experience entries
    
    return Array.from(techSet).sort();
  };
  
  const technologies = getAllTechnologies();
  
  // Calculate years of experience for each technology
  const techExperience: TechExperience[] = technologies.map((tech: string) => ({
    name: tech,
    years: getExperienceYearsForSkill(profileData, tech)
  })).filter((item: TechExperience) => item.years > 0) // Only show technologies with experience
    .sort((a: TechExperience, b: TechExperience) => b.years - a.years); // Sort by years in descending order
  
  if (techExperience.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Technology Experience</h3>
        <p className="text-gray-500 text-center py-4">
          No technology experience data available. Add technologies to your work experience entries.
        </p>
      </div>
    );
  }
  
  // Helper function to format the experience duration
  const formatExperience = (years: number): string => {
    if (years < 1) {
      // Convert to months
      const months = Math.round(years * 12);
      return `${months} ${months === 1 ? 'month' : 'months'}`;
    }
    
    // Format years with one decimal place if not a whole number
    if (years % 1 !== 0) {
      return `${years.toFixed(1)} years`;
    }
    
    return `${years} ${years === 1 ? 'year' : 'years'}`;
  };
  
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Technology Experience</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {techExperience.map((tech: TechExperience, index: number) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
            <span className="font-medium text-gray-800">{tech.name}</span>
            <div className="flex items-center">
              <span className="text-teal-700 font-semibold">
                {formatExperience(tech.years)}
              </span>
              <div className="ml-3 w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-teal-500 rounded-full" 
                  style={{ 
                    width: `${Math.max(5, Math.min(100, tech.years < 1 
                      ? (tech.years * 12 * 8) // For months (1 month = 8%)
                      : (tech.years / 10) * 100))}%` // Minimum 5% width to ensure visibility
                  }} 
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechnologyExperienceSection; 