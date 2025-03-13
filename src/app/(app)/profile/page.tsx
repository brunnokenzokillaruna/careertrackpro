'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';

// Import profile components
import ProfileHeader from '@/components/profile/ProfileHeader';
import EducationSection from '@/components/profile/EducationSection';
import ExperienceSection from '@/components/profile/ExperienceSection';
import SkillsSection from '@/components/profile/SkillsSection';
import ProjectsSection from '@/components/profile/ProjectsSection';
import CertificationsSection from '@/components/profile/CertificationsSection';
import ProfileSummary from '@/components/profile/ProfileSummary';
import LinkedInImportModal from '@/components/profile/LinkedInImportModal';
import TechnologyExperienceSection from '@/components/profile/TechnologyExperienceSection';

// Import types and utilities
import { ProfileData, AIKey } from '@/types/profile';
import { 
  parseDateString, 
  calculateTotalExperienceYears, 
  getExperienceYearsForSkill 
} from '@/components/profile/utils/ProfileUtils';

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    linkedin: '',
    github: '',
    education: [],
    experience: [],
    skills: [],
    courses: [],
    languages: [],
    projects: [],
    certifications: [],
    summary: ''
  });
  const [activeTab, setActiveTab] = useState('personal');
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [showLinkedInImportModal, setShowLinkedInImportModal] = useState(false);

  // Add these state variables for input validation
  const [inputValues, setInputValues] = useState<Record<string, string>>({
    skills: '',
    languages: '',
    courses: ''
  });
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({
    skills: '',
    languages: '',
    courses: ''
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to view your profile');
        return;
      }

      try {
        // Create a custom fetch function with the proper headers
        const customFetch = async (url: string, options: RequestInit = {}) => {
          const headers = new Headers(options.headers || {});
          headers.set('Accept', 'application/json');
          return fetch(url, { ...options, headers });
        };

        // Use the Supabase client with the proper headers
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No profile found, this is normal for new users
            console.log('No profile found for user, using empty profile');
          } else {
            console.error('Error loading profile:', error);
            toast.error('Failed to load profile data');
          }
          return;
        }

        if (data) {
          // Parse JSON strings into arrays
          try {
            const parsedData = {
              fullName: data.full_name || '',
              email: data.email || '',
              phone: data.phone || '',
              location: data.location || '',
              website: data.website || '',
              linkedin: data.linkedin || '',
              github: data.github || '',
              education: data.education ? JSON.parse(data.education) : [],
              experience: data.experience ? JSON.parse(data.experience) : [],
              skills: data.skills ? JSON.parse(data.skills) : [],
              courses: data.courses ? JSON.parse(data.courses) : [],
              languages: data.languages ? JSON.parse(data.languages) : [],
              projects: data.projects ? JSON.parse(data.projects) : [],
              certifications: data.certifications ? JSON.parse(data.certifications) : [],
              summary: data.summary || ''
            };
            setProfileData(parsedData);
          } catch (parseError) {
            console.error('Error parsing profile data:', parseError);
            toast.error('Failed to parse profile data');
          }
        }
      } catch (fetchError) {
        console.error('Error fetching profile:', fetchError);
        toast.error('Failed to fetch profile data');
      }
    } catch (authError) {
      console.error('Auth error:', authError);
      toast.error('Authentication error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFromToast = () => {
    // Call the save function without an event
    // This is a simplified version that doesn't need the event parameter
    setSaving(true);
    
    try {
      // Save the profile data
      saveProfileToDatabase()
        .then(() => {
          toast.success('Profile saved successfully');
        })
        .catch((error) => {
          console.error('Error saving profile:', error);
          toast.error('Failed to save profile');
        })
        .finally(() => {
          setSaving(false);
        });
    } catch (error) {
      console.error('Error in handleSaveFromToast:', error);
      toast.error('An unexpected error occurred');
      setSaving(false);
    }
  };

  // Function to save profile data to the database
  const saveProfileToDatabase = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('You must be logged in to save your profile');
    }

    // Convert arrays to JSON strings for storage
    const profileToSave = {
      user_id: user.id,
      full_name: profileData.fullName,
      email: profileData.email,
      phone: profileData.phone,
      location: profileData.location,
      website: profileData.website,
      linkedin: profileData.linkedin,
      github: profileData.github,
      education: JSON.stringify(profileData.education),
      experience: JSON.stringify(profileData.experience),
      skills: JSON.stringify(profileData.skills),
      courses: JSON.stringify(profileData.courses),
      languages: JSON.stringify(profileData.languages),
      projects: JSON.stringify(profileData.projects),
      certifications: JSON.stringify(profileData.certifications),
      summary: profileData.summary
    };

    // Check if a profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Failed to check existing profile');
    }

    if (existingProfile) {
      // Update existing profile
      const { error } = await supabase
        .from('user_profiles')
        .update(profileToSave)
        .eq('user_id', user.id);
      
      if (error) {
        throw new Error('Failed to save profile: ' + error.message);
      }
    } else {
      // Insert new profile
      const { error } = await supabase
        .from('user_profiles')
        .insert(profileToSave);
      
      if (error) {
        throw new Error('Failed to save profile: ' + error.message);
      }
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await saveProfileToDatabase();
      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof ProfileData, index: number, value: string) => {
    setProfileData(prev => {
      const newArray = [...(prev[field] as any[])];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddArrayItem = (field: keyof ProfileData) => {
    setProfileData(prev => {
      let newItem;
      
      switch (field) {
        case 'education':
          newItem = { institution: '', degree: '', field: '', startDate: '', endDate: '' };
          break;
        case 'experience':
          newItem = { 
            company: '', 
            position: '', 
            startDate: '', 
            endDate: '', 
            location: '',
            technologies: '',
            description: ''
          };
          break;
        case 'projects':
          newItem = { name: '', description: '', technologies: '' };
          break;
        case 'certifications':
          newItem = { name: '', issuer: '', date: '' };
          break;
        default:
          newItem = '';
      }
      
      return {
        ...prev,
        [field]: [...(prev[field] as any[]), newItem]
      };
    });
  };

  const handleRemoveArrayItem = (field: keyof ProfileData, index: number) => {
    setProfileData(prev => {
      const newArray = [...(prev[field] as any[])];
      newArray.splice(index, 1);
      return { ...prev, [field]: newArray };
    });
  };

  const handleClearProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to clear your profile');
        return;
      }

      try {
        const { error } = await supabase
          .from('user_profiles')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error('Error deleting profile:', error);
          toast.error('Failed to delete profile: ' + error.message);
          return;
        }
        
        setProfileData({
          fullName: '',
          email: '',
          phone: '',
          location: '',
          website: '',
          linkedin: '',
          github: '',
          education: [],
          experience: [],
          skills: [],
          courses: [],
          languages: [],
          projects: [],
          certifications: [],
          summary: ''
        });
        
        toast.success('Profile data cleared successfully');
        setShowClearDataModal(false);
      } catch (apiError) {
        console.error('API error while clearing profile:', apiError);
        toast.error('API error while clearing profile');
      }
    } catch (error) {
      console.error('Error clearing profile data:', error);
      toast.error('Failed to clear profile data');
    }
  };

  const handleStructuredChange = (field: keyof ProfileData, index: number, property: string, value: string) => {
    setProfileData(prev => {
      const newArray = [...(prev[field] as any[])];
      newArray[index] = { ...newArray[index], [property]: value };
      return { ...prev, [field]: newArray };
    });
  };

  const handleAddSimpleItem = (field: keyof Pick<ProfileData, 'skills' | 'courses' | 'languages'>) => {
    const value = inputValues[field]?.trim();
    
    if (!value) {
      setInputErrors(prev => ({ ...prev, [field]: 'Please enter a value' }));
      return;
    }
    
    // Check if item already exists
    if ((profileData[field] as string[]).includes(value)) {
      setInputErrors(prev => ({ ...prev, [field]: 'This item already exists' }));
      return;
    }
    
    setProfileData(prev => ({
                        ...prev,
      [field]: [...(prev[field] as string[]), value]
    }));
    
    // Clear input
    setInputValues(prev => ({ ...prev, [field]: '' }));
    setInputErrors(prev => ({ ...prev, [field]: '' }));
  };

  const renderTextField = (name: string, label: string, placeholder: string, icon: React.ReactNode) => {
    return (
      <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {icon}
          </div>
          <input
            type="text"
            name={name}
            id={name}
            className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
            placeholder={placeholder}
            value={(profileData as any)[name] || ''}
            onChange={handleChange}
          />
        </div>
      </div>
    );
  };

  // Wrapper functions for the utility functions
  const calculateTotalExperienceYearsWrapper = () => {
    return calculateTotalExperienceYears(profileData);
  };

  const getExperienceYearsForSkillWrapper = (skill: string) => {
    return getExperienceYearsForSkill(profileData, skill);
  };

  // Add this new function to handle LinkedIn data import
  const handleLinkedInImport = (linkedinData: Partial<ProfileData>) => {
    // Merge the LinkedIn data with existing profile data
    setProfileData(prevData => {
      const newData = { ...prevData };
      
      // Update basic info if provided
      if (linkedinData.fullName) newData.fullName = linkedinData.fullName;
      if (linkedinData.email) newData.email = linkedinData.email;
      if (linkedinData.phone) newData.phone = linkedinData.phone;
      if (linkedinData.location) newData.location = linkedinData.location;
      if (linkedinData.linkedin) newData.linkedin = linkedinData.linkedin;
      if (linkedinData.summary) newData.summary = linkedinData.summary;
      
      // Merge arrays (education, experience, skills, etc.)
      if (linkedinData.education && linkedinData.education.length > 0) {
        newData.education = [...linkedinData.education];
      }
      
      if (linkedinData.experience && linkedinData.experience.length > 0) {
        newData.experience = [...linkedinData.experience];
      }
      
      if (linkedinData.skills && linkedinData.skills.length > 0) {
        newData.skills = Array.from(new Set([...newData.skills, ...linkedinData.skills]));
      }
      
      if (linkedinData.certifications && linkedinData.certifications.length > 0) {
        newData.certifications = [...linkedinData.certifications];
      }
      
      if (linkedinData.languages && linkedinData.languages.length > 0) {
        newData.languages = Array.from(new Set([...newData.languages, ...linkedinData.languages]));
      }
      
      return newData;
    });
    
    toast.success('Profile updated with LinkedIn data. Don\'t forget to save your changes!');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowClearDataModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              Clear Data
            </button>
            <button
              type="button"
              onClick={() => setShowLinkedInImportModal(true)}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-teal-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              Import LinkedIn
            </button>
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-teal-700 hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'personal'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('personal')}
              >
                Personal Info
              </button>
              <button
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'education'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('education')}
              >
                Education & Experience
              </button>
              <button
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'skills'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('skills')}
              >
                Skills & Languages
              </button>
              <button
                className={`w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'projects'
                    ? 'border-teal-600 text-teal-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab('projects')}
              >
                Projects & Certifications
              </button>
            </nav>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {activeTab === 'personal' && (
            <div className="space-y-6">
              <ProfileHeader 
                profileData={profileData}
                handleChange={handleChange}
                renderTextField={renderTextField}
              />
              <TechnologyExperienceSection profileData={profileData} />
            </div>
          )}

          {activeTab === 'education' && (
            <div className="space-y-6">
              <EducationSection 
                profileData={profileData}
                handleStructuredChange={handleStructuredChange}
                handleRemoveArrayItem={handleRemoveArrayItem}
                handleAddArrayItem={handleAddArrayItem}
              />
              
              <ExperienceSection 
                profileData={profileData}
                handleStructuredChange={handleStructuredChange}
                handleRemoveArrayItem={handleRemoveArrayItem}
                handleAddArrayItem={handleAddArrayItem}
              />
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              <SkillsSection 
                profileData={profileData}
                handleRemoveArrayItem={handleRemoveArrayItem}
                handleAddSimpleItem={handleAddSimpleItem}
                inputValues={inputValues}
                setInputValues={setInputValues}
                inputErrors={inputErrors}
                setInputErrors={setInputErrors}
                getExperienceYearsForSkill={getExperienceYearsForSkillWrapper}
              />
            </div>
          )}

          {activeTab === 'projects' && (
            <div className="space-y-6">
              <ProjectsSection 
                profileData={profileData}
                handleStructuredChange={handleStructuredChange}
                handleRemoveArrayItem={handleRemoveArrayItem}
                handleAddArrayItem={handleAddArrayItem}
              />
              
              <CertificationsSection 
                profileData={profileData}
                handleStructuredChange={handleStructuredChange}
                handleRemoveArrayItem={handleRemoveArrayItem}
                handleAddArrayItem={handleAddArrayItem}
              />
            </div>
          )}
        </form>

        {/* Confirmation Modal for Clearing Data */}
        <ConfirmationModal
          isOpen={showClearDataModal}
          onClose={() => setShowClearDataModal(false)}
          onConfirm={handleClearProfileData}
          title="Clear Profile Data"
          message="Are you sure you want to clear all your profile data? This action cannot be undone."
          confirmButtonText="Clear Data"
          cancelButtonText="Cancel"
        />

        {/* LinkedIn Import Modal */}
        <LinkedInImportModal
          isOpen={showLinkedInImportModal}
          onClose={() => setShowLinkedInImportModal(false)}
          onImportComplete={handleLinkedInImport}
        />
      </div>
    </>
  );
} 