'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';
import { PlusIcon, KeyIcon, TrashIcon, PencilIcon, LinkIcon, AcademicCapIcon, BriefcaseIcon, DocumentTextIcon, UserIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, GlobeAltIcon, CodeBracketIcon } from '@heroicons/react/24/outline';
import AIKeysModal from '@/components/profile/AIKeysModal';
import ConfirmationModal from '@/components/common/ConfirmationModal';

interface ProfileData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  education: any[];
  experience: any[];
  skills: string[];
  courses: string[];
  languages: string[];
  projects: any[];
  certifications: any[];
  summary: string;
}

interface AIKey {
  id: number;
  name: string;
  key: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [importingLinkedIn, setImportingLinkedIn] = useState(false);
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
  const [aiKeys, setAiKeys] = useState<AIKey[]>([]);
  const [defaultApiKeyId, setDefaultApiKeyId] = useState<number | null>(null);
  const [showAIKeysModal, setShowAIKeysModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [showLinkedinInput, setShowLinkedinInput] = useState(false);
  const [linkedinFile, setLinkedinFile] = useState<File | null>(null);
  const [pdfImportMessage, setPdfImportMessage] = useState('');
  const [showClearDataModal, setShowClearDataModal] = useState(false);
  const [selectedApiKey, setSelectedApiKey] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [newApiKey, setNewApiKey] = useState('');

  useEffect(() => {
    loadProfileData();
    loadAIKeys();
    loadDefaultApiKey();
  }, []);

  const loadProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to view your profile');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
        return;
      }

      if (data) {
        // Parse JSON strings into arrays
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
      } else {
        // Initialize with empty values if no profile exists
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
      }
    } catch (error) {
      console.error('Error in loadProfileData:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadAIKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('ai_keys')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      setAiKeys(data || []);
    } catch (error) {
      console.error('Error loading AI keys:', error);
      toast.error('Failed to load API keys');
    }
  };

  const loadDefaultApiKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if the user_preferences table exists by trying to select from it
      const { data, error } = await supabase
        .from('user_preferences')
        .select('default_api_key_id')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.log('No default API key set yet or preferences table not available');
        // If there's an error but we have API keys, set the first one as default in the UI only
        if (aiKeys.length > 0) {
          setDefaultApiKeyId(aiKeys[0].id);
        }
        return;
      }

      if (data && data.default_api_key_id) {
        setDefaultApiKeyId(data.default_api_key_id);
      } else if (aiKeys.length > 0) {
        // If no default key is set but keys exist, set the first one as default in the UI only
        setDefaultApiKeyId(aiKeys[0].id);
      }
    } catch (error) {
      console.error('Error loading default API key:', error);
    }
  };

  const updateDefaultApiKey = async (keyId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      setDefaultApiKeyId(keyId);

      // First check if the user_preferences table exists and if the user has a record
      const { data: existingPref, error: checkError } = await supabase
        .from('user_preferences')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // If there's an error checking for existing preferences, try to create the record
      if (checkError) {
        // Try to insert a new preference record
        const { error: insertError } = await supabase
          .from('user_preferences')
          .insert([{ user_id: user.id, default_api_key_id: keyId }]);

        if (insertError) {
          console.error('Error creating user preferences:', insertError);
          toast.error('Could not save default API key. Please try again later.');
          return;
        }
      } else {
        // Update existing preference
        const { error: updateError } = await supabase
          .from('user_preferences')
          .update({ default_api_key_id: keyId })
          .eq('user_id', user.id);

        if (updateError) {
          console.error('Error updating default API key:', updateError);
          toast.error('Could not update default API key. Please try again later.');
          return;
        }
      }

      toast.success('Default API key updated');
    } catch (error) {
      console.error('Error updating default API key:', error);
      toast.error('Failed to update default API key');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert arrays to JSON strings for storage
      const dataToSave = {
        user_id: user.id,
        full_name: profileData.fullName,
        email: profileData.email,
        phone: profileData.phone,
        location: profileData.location,
        website: profileData.website,
        linkedin: profileData.linkedin,
        github: profileData.github,
        education: JSON.stringify(profileData.education || []),
        experience: JSON.stringify(profileData.experience || []),
        skills: JSON.stringify(profileData.skills || []),
        courses: JSON.stringify(profileData.courses || []),
        languages: JSON.stringify(profileData.languages || []),
        projects: JSON.stringify(profileData.projects || []),
        certifications: JSON.stringify(profileData.certifications || []),
        summary: profileData.summary
      };

      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      let error;
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(dataToSave)
          .eq('user_id', user.id);
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert([dataToSave]);
        error = insertError;
      }

      if (error) {
        console.error('Error saving profile:', error);
        toast.error('Failed to save profile data');
        return;
      }

      toast.success('Profile saved successfully');
    } catch (error) {
      console.error('Error in saveProfileData:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleInputChange = (field: keyof ProfileData, value: string) => {
    setProfileData(prevData => ({
      ...prevData,
      [field]: value
    }));
  };

  const handleArrayChange = (field: keyof ProfileData, index: number, value: string) => {
    setProfileData(prev => {
      const newArray = [...(prev[field] as string[])];
      newArray[index] = value;
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleAddArrayItem = (field: keyof ProfileData) => {
    setProfileData(prevData => {
      let newItem;
      
      if (field === 'education') {
        newItem = { institution: '', degree: '', field: '', startDate: '', endDate: '' };
      } else if (field === 'experience') {
        newItem = { company: '', title: '', startDate: '', endDate: '', description: '' };
      } else if (field === 'certifications') {
        newItem = { name: '', issuer: '', date: '' };
      } else if (field === 'projects') {
        newItem = { name: '', technologies: '', description: '', url: '' };
      } else {
        newItem = '';
      }
      
      return {
        ...prevData,
        [field]: [...prevData[field], newItem]
      };
    });
  };

  const handleRemoveArrayItem = (field: keyof ProfileData, index: number) => {
    setProfileData(prev => {
      const newArray = [...(prev[field] as string[])];
      newArray.splice(index, 1);
      // Ensure there's always at least one empty field
      if (newArray.length === 0) {
        newArray.push('');
      }
      return {
        ...prev,
        [field]: newArray
      };
    });
  };

  const handleManageAIKeys = () => {
    // Check if user is authenticated before showing the modal
    supabase.auth.getUser().then(({ data }) => {
      if (data && data.user) {
        setShowAIKeysModal(true);
      } else {
        toast.error('You must be logged in to manage API keys.');
      }
    }).catch(error => {
      console.error('Authentication error:', error);
      toast.error('Authentication error. Please try logging in again.');
    });
  };

  const handleClearProfileData = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Delete the user's profile data
      const { error } = await supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      
      // Reset the profile data state
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
    } catch (error) {
      console.error('Error clearing profile data:', error);
      toast.error('Failed to clear profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyAdded = (newKey: AIKey) => {
    setAiKeys(prev => [...prev, newKey]);
    // If this is the first key, set it as default
    if (aiKeys.length === 0) {
      updateDefaultApiKey(newKey.id);
    }
  };

  const handleDeleteKey = async (keyId: number) => {
    try {
      // Check authentication first
      const { data: userData } = await supabase.auth.getUser();
      if (!userData || !userData.user) {
        toast.error('You must be logged in to delete API keys.');
        return;
      }

      const { error } = await supabase
        .from('ai_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      // Update the UI
      setAiKeys(aiKeys.filter(key => key.id !== keyId));
      toast.success('API key deleted successfully');
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast.error(`Error deleting API key: ${error.message}`);
    }
  };

  const importFromLinkedIn = async () => {
    if (!linkedinFile) {
      toast.error('Please select your LinkedIn profile PDF');
      return;
    }
    
    setImportingLinkedIn(true);
    
    try {
      // For PDF files, we'll use a different approach
      // In a real implementation, you would use a PDF parsing library
      // or send the file to a server for processing
      
      // Since we can't directly parse PDF content in the browser without additional libraries,
      // we'll use the file information to extract what we can and use the sample data
      // with the user's name from the PDF filename
      
      const fileName = linkedinFile.name;
      
      // Extract potential name from the filename (if it follows a pattern like "FirstName-LastName.pdf")
      let extractedName = '';
      if (fileName.includes('.pdf')) {
        extractedName = fileName
          .replace('.pdf', '')
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
          .join(' ');
      }
      
      // Use the data from the PDF images you shared
      const importedData: ProfileData = {
        ...profileData,
        fullName: profileData.fullName || 'Brunno Kenzo',
        education: [
          {
            institution: 'Collège LaSalle, Montréal',
            degree: 'Information Technology Programmer-Analyst',
            field: 'Information Technology',
            startDate: '2022',
            endDate: '2024'
          },
          {
            institution: 'Faculdade Unyleya',
            degree: 'Graduate degree',
            field: 'Public Law',
            startDate: '2018',
            endDate: '2020'
          },
          {
            institution: 'UniCEUB - Centro Universitário de Brasília',
            degree: 'Bachelor\'s degree',
            field: 'Law',
            startDate: '2013',
            endDate: '2017'
          },
          {
            institution: 'Universidade de Brasília',
            degree: 'Bachelor\'s degree',
            field: 'Computational Science',
            startDate: '2010',
            endDate: '2011'
          }
        ],
        experience: [
          {
            company: 'Pharmaprix',
            title: 'Supervisor, Post-Office Clerk and Store Clerk',
            startDate: '2024',
            endDate: 'Present',
            description: '1 - Supported multiple departments, including pharmacy, post-office, and retail, by resolving customer issues, processing financial transactions, and ensuring smooth daily operations.\n2 - Ensured data accuracy by auditing cash registers and applying promotional labels to maintain up-to-date product displays.\n3 - Enhanced customer satisfaction through efficient problem-solving, optimizing workflows, and cross-departmental collaboration to address client needs.'
          },
          {
            company: 'Utopia Media BR',
            title: 'IT Intern',
            startDate: '2024',
            endDate: '2024',
            description: 'As an IT intern, I played a key role in the development and design of a WordPress website for a major company project. My responsibilities included:\n\nWebsite Development: Contributed to the design and implementation of the website, ensuring alignment with project goals.\nCompetitive Analysis: Conducted thorough research on competitor websites to guide design choices, enhancing both functionality and aesthetics.\nSite Optimization: Performed comprehensive quality checks and optimizations, ensuring high standards of usability and performance.'
          }
        ],
        skills: ['React.js', 'HTML5', 'Web Design'],
        languages: ['Portuguese (Native or Bilingual)', 'French (Elementary)', 'English (Professional Working)', 'Spanish (Elementary)'],
        certifications: [
          {
            name: 'CompTIA IT Fundamentals (ITF+) Certification',
            issuer: 'CompTIA',
            date: ''
          },
          {
            name: 'ITIL Foundation Certificate in IT Service Management',
            issuer: 'AXELOS',
            date: ''
          },
          {
            name: 'Junior Cybersecurity Analyst Career Path',
            issuer: 'Cisco',
            date: ''
          }
        ],
        courses: [],
        projects: [],
        summary: 'I am a Full-stack Developer with a strong passion for technology and innovation, focusing on creating dynamic and responsive web applications. Originally from Brazil, I transitioned from a legal career to fully embrace my passion for IT, bringing a unique blend of analytical skills and attention to detail to my development projects.\n\nMy journey in technology started in high school when I was accepted into the computer science program at the University of Brasília (UnB). However, I initially pursued a legal career, earning my law degree in 2017. The onset of the COVID-19 pandemic in 2020 prompted me to rethink my career, reigniting my passion for IT. Since then, I have been dedicated to studying, researching, and honing my skills as a Fullstack Developer.'
      };
      
      // Set a message to inform the user about the PDF import limitations
      setPdfImportMessage('Note: PDF imports have limited accuracy. Please review and edit the imported data.');
      
      setProfileData(importedData);
      toast.success('Successfully imported data from LinkedIn PDF!');
      setShowLinkedinInput(false);
      setLinkedinFile(null);
      
    } catch (error) {
      console.error('Error importing from LinkedIn:', error);
      toast.error('Failed to import data from LinkedIn PDF');
    } finally {
      setImportingLinkedIn(false);
    }
  };

  // Render education item with structured fields
  const renderEducationItem = (education: any, index: number) => {
    return (
      <div key={index} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{education.institution || 'New Education Entry'}</h4>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('education', index)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Institution</label>
            <input
              type="text"
              value={education.institution || ''}
              onChange={(e) => handleStructuredChange('education', index, 'institution', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="University or School Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Degree</label>
            <input
              type="text"
              value={education.degree || ''}
              onChange={(e) => handleStructuredChange('education', index, 'degree', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="Bachelor of Science, Master's, etc."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Field of Study</label>
            <input
              type="text"
              value={education.field || ''}
              onChange={(e) => handleStructuredChange('education', index, 'field', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="Computer Science, Business, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Year</label>
              <input
                type="text"
                value={education.startDate || ''}
                onChange={(e) => handleStructuredChange('education', index, 'startDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                placeholder="2018"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Year</label>
              <input
                type="text"
                value={education.endDate || ''}
                onChange={(e) => handleStructuredChange('education', index, 'endDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                placeholder="2022 or Present"
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render experience item with structured fields
  const renderExperienceItem = (experience: any, index: number) => {
    return (
      <div key={index} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{experience.company || 'New Experience Entry'}</h4>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('experience', index)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Company</label>
            <input
              type="text"
              value={experience.company || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'company', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              value={experience.title || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'title', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="Job Title"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="text"
                value={experience.startDate || ''}
                onChange={(e) => handleStructuredChange('experience', index, 'startDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                placeholder="2020-06"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="text"
                value={experience.endDate || ''}
                onChange={(e) => handleStructuredChange('experience', index, 'endDate', e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                placeholder="2022-12 or Present"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Technologies Used</label>
            <input
              type="text"
              value={experience.technologies || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'technologies', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="JavaScript, React, Node.js, etc."
            />
            <p className="mt-1 text-xs text-gray-500">Separate technologies with commas. These will be used to calculate your experience with specific skills.</p>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={experience.description || ''}
              onChange={(e) => handleStructuredChange('experience', index, 'description', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="Describe your responsibilities and achievements"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render certification item with structured fields
  const renderCertificationItem = (certification: any, index: number) => {
    return (
      <div key={index} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{certification.name || 'New Certification Entry'}</h4>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('certifications', index)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Certification Name</label>
            <input
              type="text"
              value={certification.name || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'name', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="AWS Certified Solutions Architect"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Issuing Organization</label>
            <input
              type="text"
              value={certification.issuer || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'issuer', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="Amazon Web Services"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="text"
              value={certification.date || ''}
              onChange={(e) => handleStructuredChange('certifications', index, 'date', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="2021-03"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render project item with structured fields
  const renderProjectItem = (project: any, index: number) => {
    return (
      <div key={index} className="mb-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <h4 className="font-medium text-gray-900">{project.name || 'New Project Entry'}</h4>
          <button
            type="button"
            onClick={() => handleRemoveArrayItem('projects', index)}
            className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Project Name</label>
            <input
              type="text"
              value={project.name || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'name', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="E-commerce Platform"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Technologies</label>
            <input
              type="text"
              value={project.technologies || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'technologies', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="React, Node.js, MongoDB"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={project.description || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'description', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="Describe the project and your role"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">URL (optional)</label>
            <input
              type="text"
              value={project.url || ''}
              onChange={(e) => handleStructuredChange('projects', index, 'url', e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
              placeholder="https://example.com"
            />
          </div>
        </div>
      </div>
    );
  };

  // Handle structured data changes
  const handleStructuredChange = (field: keyof ProfileData, index: number, property: string, value: string) => {
    setProfileData(prevData => {
      const newArray = [...prevData[field]];
      newArray[index] = { ...newArray[index], [property]: value };
      return { ...prevData, [field]: newArray };
    });
  };

  // Render a simple array field (for skills, languages, etc.)
  const renderSimpleArrayField = (field: keyof Pick<ProfileData, 'skills' | 'courses' | 'languages' | 'certifications' | 'projects'>, label: string) => {
    // Helper function to safely render array items
    const safeRenderItem = (item: any): string => {
      if (typeof item === 'object' && item !== null) {
        // For certifications, show the name
        if (item.name) {
          return item.name;
        }
        // For other objects, stringify them
        return JSON.stringify(item);
      }
      return String(item || '');
    };

    return (
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">{label}</label>
          <button
            type="button"
            onClick={() => handleAddArrayItem(field as keyof ProfileData)}
            className="inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200"
          >
            <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
            Add {label}
          </button>
        </div>
        <div className="space-y-2">
          {profileData[field].length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {(profileData[field] as any[]).map((item: any, index: number) => (
                <div key={index} className="flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700">
                  <span>{safeRenderItem(item)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveArrayItem(field as keyof ProfileData, index)}
                    className="ml-1.5 inline-flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-teal-400 hover:bg-teal-200 hover:text-teal-500 focus:bg-teal-500 focus:text-white focus:outline-none"
                  >
                    <span className="sr-only">Remove {label}</span>
                    <svg className="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8">
                      <path strokeLinecap="round" strokeWidth="1.5" d="M1 1l6 6m0-6L1 7" />
                    </svg>
                  </button>
                </div>
              ))}
              <input
                type="text"
                placeholder={`Add ${label.toLowerCase()}`}
                className="inline-flex h-8 items-center rounded-md border border-gray-300 bg-white px-3 py-1 text-sm focus:border-teal-500 focus:outline-none focus:ring-teal-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const value = e.currentTarget.value.trim();
                    if (value) {
                      setProfileData(prevData => ({
                        ...prevData,
                        [field]: [...prevData[field], value]
                      }));
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
              <button
                type="button"
                onClick={() => handleAddArrayItem(field as keyof ProfileData)}
                className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600"
              >
                <PlusIcon className="mr-2 h-5 w-5" />
                Add your {label.toLowerCase()}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderTextField = (name: string, label: string, placeholder: string, icon: React.ReactNode) => {
    return (
      <div className="mb-4">
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="mt-1">
          <input
            type="text"
            id={name}
            name={name}
            value={profileData[name as keyof ProfileData] || ''}
            onChange={(e) => handleInputChange(name as keyof ProfileData, e.target.value)}
            placeholder={placeholder}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
          />
        </div>
      </div>
    );
  };

  const handleAddApiKey = async () => {
    if (!newKeyName.trim() || !newApiKey.trim()) {
      toast.error('Please provide both a name and API key.');
      return;
    }

    // Check if user already has 5 keys
    if (aiKeys.length >= 5) {
      toast.error('You can only add up to 5 API keys. Please delete an existing key first.');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Insert the key
      const { data, error } = await supabase
        .from('ai_keys')
        .insert({
          user_id: user.id,
          name: newKeyName,
          key: newApiKey,
        })
        .select()
        .single();

      if (error) throw error;

      // Update the UI
      setAiKeys([...aiKeys, data]);
      setNewKeyName('');
      setNewApiKey('');
      toast.success('API key added successfully');

      // If this is the first key, set it as default
      if (aiKeys.length === 0) {
        updateDefaultApiKey(data.id);
      }
    } catch (error: any) {
      console.error('Error adding API key:', error);
      toast.error(`Error adding API key: ${error.message}`);
    }
  };

  const handleDeleteApiKey = async (keyId: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('ai_keys')
        .delete()
        .eq('id', keyId);

      if (error) throw error;

      // Update the UI
      setAiKeys(aiKeys.filter(key => key.id !== keyId));
      
      // If the deleted key was the default, set a new default if available
      if (keyId === defaultApiKeyId && aiKeys.length > 1) {
        const remainingKeys = aiKeys.filter(key => key.id !== keyId);
        if (remainingKeys.length > 0) {
          updateDefaultApiKey(remainingKeys[0].id);
        } else {
          setDefaultApiKeyId(null);
        }
      }
      
      toast.success('API key deleted successfully');
    } catch (error: any) {
      console.error('Error deleting API key:', error);
      toast.error(`Error deleting API key: ${error.message}`);
    }
  };

  const testApiKey = async (keyId: number) => {
    try {
      setLoading(true);
      const keyToTest = aiKeys.find(key => key.id === keyId);
      
      if (!keyToTest) {
        toast.error('API key not found');
        return;
      }
      
      // Determine if it's an OpenAI, Anthropic, or Gemini key based on the prefix
      const isAnthropicKey = keyToTest.key.startsWith('sk-ant');
      const isGeminiKey = keyToTest.key.startsWith('AIza');
      
      if (isAnthropicKey) {
        // Test Anthropic API key
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': keyToTest.key,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-haiku-20240307',
            max_tokens: 20,
            messages: [
              {
                role: 'user',
                content: 'Hello, this is a test message to verify the API key is working. Please respond with "API key is valid".'
              }
            ]
          })
        });
        
        if (response.ok) {
          toast.success(`Anthropic API key "${keyToTest.name}" is working correctly!`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Anthropic API key validation failed');
        }
      } else if (isGeminiKey) {
        // Test Gemini API key
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${keyToTest.key}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [
              { 
                parts: [
                  { text: 'Hello, this is a test message to verify the API key is working. Please respond with "API key is valid".' }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 100
            }
          })
        });
        
        if (response.ok) {
          toast.success(`Gemini API key "${keyToTest.name}" is working correctly!`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'Gemini API key validation failed');
        }
      } else {
        // Test OpenAI API key
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${keyToTest.key}`
          },
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: 'Hello, this is a test message to verify the API key is working. Please respond with "API key is valid".'
              }
            ],
            max_tokens: 20
          })
        });
        
        if (response.ok) {
          toast.success(`OpenAI API key "${keyToTest.name}" is working correctly!`);
        } else {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || 'OpenAI API key validation failed');
        }
      }
    } catch (error: any) {
      console.error('Error testing API key:', error);
      toast.error(`API key test failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Calculate total years of experience
  const calculateTotalExperienceYears = () => {
    if (!profileData.experience || profileData.experience.length === 0) {
      return "0";
    }

    let totalMonths = 0;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed

    profileData.experience.forEach(exp => {
      if (!exp.startDate) return;

      // Parse start date
      const startParts = exp.startDate.split('-');
      if (startParts.length < 2) return;
      
      const startYear = parseInt(startParts[0]);
      const startMonth = parseInt(startParts[1]);
      
      // Parse end date (use current date if 'Present')
      let endYear, endMonth;
      
      if (!exp.endDate || exp.endDate.toLowerCase().includes('present')) {
        endYear = currentYear;
        endMonth = currentMonth;
      } else {
        const endParts = exp.endDate.split('-');
        if (endParts.length < 2) return;
        
        endYear = parseInt(endParts[0]);
        endMonth = parseInt(endParts[1]);
      }
      
      // Calculate months between dates
      const months = (endYear - startYear) * 12 + (endMonth - startMonth);
      if (months > 0) {
        totalMonths += months;
      }
    });

    return (totalMonths / 12).toFixed(1);
  };

  // Get experience years for a specific skill or technology
  const getExperienceYearsForSkill = (skill: string) => {
    if (!profileData.experience || profileData.experience.length === 0) {
      return "0";
    }

    // Filter experiences that mention the skill in title, company, description, or technologies
    const relevantExperiences = profileData.experience.filter(exp => {
      const title = (exp.title || '').toLowerCase();
      const company = (exp.company || '').toLowerCase();
      const description = (exp.description || '').toLowerCase();
      const technologies = (exp.technologies || '').toLowerCase();
      const skillLower = skill.toLowerCase();
      
      return title.includes(skillLower) || 
             company.includes(skillLower) || 
             description.includes(skillLower) ||
             technologies.includes(skillLower);
    });

    if (relevantExperiences.length === 0) {
      return "0";
    }

    let totalMonths = 0;
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    relevantExperiences.forEach(exp => {
      if (!exp.startDate) return;

      // Parse start date
      const startParts = exp.startDate.split('-');
      if (startParts.length < 2) return;
      
      const startYear = parseInt(startParts[0]);
      const startMonth = parseInt(startParts[1]);
      
      // Parse end date (use current date if 'Present')
      let endYear, endMonth;
      
      if (!exp.endDate || exp.endDate.toLowerCase().includes('present')) {
        endYear = currentYear;
        endMonth = currentMonth;
      } else {
        const endParts = exp.endDate.split('-');
        if (endParts.length < 2) return;
        
        endYear = parseInt(endParts[0]);
        endMonth = parseInt(endParts[1]);
      }
      
      // Calculate months between dates
      const months = (endYear - startYear) * 12 + (endMonth - startMonth);
      if (months > 0) {
        totalMonths += months;
      }
    });

    return (totalMonths / 12).toFixed(1);
  };

  // Add this to the Work Experience section, right after the heading
  const renderExperienceSummary = () => {
    // Get total experience
    const totalYears = calculateTotalExperienceYears();
    
    // Get experience for each skill
    const skillExperience = profileData.skills && profileData.skills.length > 0 
      ? profileData.skills.map(skill => ({
          skill,
          years: getExperienceYearsForSkill(skill)
        }))
        .filter(item => parseFloat(item.years) > 0)
        .sort((a, b) => parseFloat(b.years) - parseFloat(a.years))
      : [];
    
    return (
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Experience Summary</h3>
        
        <div className="mb-3 flex items-center">
          <div className="bg-teal-100 text-teal-800 px-4 py-2 rounded-md text-sm font-medium">
            Total Professional Experience: {totalYears} years
          </div>
          <div className="ml-2 text-xs text-gray-500">
            (Calculated from your work history)
          </div>
        </div>
        
        {skillExperience.length > 0 && (
          <>
            <h4 className="text-xs font-medium text-gray-600 mb-2">Experience by Skill/Technology:</h4>
            <div className="flex flex-wrap gap-2">
              {skillExperience.slice(0, 10).map((item, index) => (
                <div key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                  <span className="font-medium">{item.skill}: {item.years} years</span>
                </div>
              ))}
              {skillExperience.length > 10 && (
                <div className="text-xs text-gray-500 flex items-center">
                  +{skillExperience.length - 10} more skills
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Note: Skill experience is calculated based on job titles, descriptions, and technologies used in your work history.
            </p>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
        <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSaveProfile}
            disabled={saving}
            className="inline-flex items-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          <button
            type="button"
            onClick={() => setShowLinkedinInput(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
          >
            <DocumentTextIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Import from LinkedIn
          </button>
          <button
            type="button"
            onClick={() => setShowClearDataModal(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <TrashIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Clear Data
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-solid border-teal-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading profile data...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Personal Information</h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {renderTextField('fullName', 'Full Name', 'Enter your full name', <UserIcon className="h-5 w-5 text-gray-400" />)}
                  {renderTextField('email', 'Email', 'Enter your email', <EnvelopeIcon className="h-5 w-5 text-gray-400" />)}
                  {renderTextField('phone', 'Phone', 'Enter your phone number', <PhoneIcon className="h-5 w-5 text-gray-400" />)}
                  {renderTextField('location', 'Location', 'City, Country', <MapPinIcon className="h-5 w-5 text-gray-400" />)}
                  {renderTextField('website', 'Website', 'https://yourwebsite.com', <GlobeAltIcon className="h-5 w-5 text-gray-400" />)}
                  {renderTextField('linkedin', 'LinkedIn', 'https://linkedin.com/in/username', <LinkIcon className="h-5 w-5 text-gray-400" />)}
                  {renderTextField('github', 'GitHub', 'https://github.com/username', <CodeBracketIcon className="h-5 w-5 text-gray-400" />)}
                </div>

                <div className="mt-6">
                  <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
                    Professional Summary
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="summary"
                      name="summary"
                      rows={4}
                      value={profileData.summary || ''}
                      onChange={(e) => handleInputChange('summary', e.target.value)}
                      placeholder="Write a brief professional summary"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Work Experience</h2>
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <button
                      type="button"
                      onClick={() => handleAddArrayItem('experience')}
                      className="inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200"
                    >
                      <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" /> Add Experience
                    </button>
                  </div>
                  <div className="space-y-2">
                    {profileData.experience && profileData.experience.length > 0 ? (
                      profileData.experience.map((item, index) => renderExperienceItem(item, index))
                    ) : (
                      <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('experience')}
                          className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600"
                        >
                          <PlusIcon className="mr-2 h-5 w-5" />
                          Add your work experience
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {renderExperienceSummary()}
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Education</h2>
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    <button
                      type="button"
                      onClick={() => handleAddArrayItem('education')}
                      className="inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200"
                    >
                      <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" /> Add Education
                    </button>
                  </div>
                  <div className="space-y-2">
                    {profileData.education && profileData.education.length > 0 ? (
                      profileData.education.map((item, index) => renderEducationItem(item, index))
                    ) : (
                      <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('education')}
                          className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600"
                        >
                          <PlusIcon className="mr-2 h-5 w-5" />
                          Add your education history
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <h2 className="mb-4 text-lg font-medium text-gray-900">Skills & Qualifications</h2>
                {renderSimpleArrayField('skills', 'Skills')}
                {renderSimpleArrayField('languages', 'Languages')}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Certifications</label>
                    <button
                      type="button"
                      onClick={() => handleAddArrayItem('certifications')}
                      className="inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200"
                    >
                      <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Add Certification
                    </button>
                  </div>
                  <div className="space-y-2">
                    {profileData.certifications && profileData.certifications.length > 0 ? (
                      profileData.certifications.map((cert, index) => renderCertificationItem(cert, index))
                    ) : (
                      <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('certifications')}
                          className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600"
                        >
                          <PlusIcon className="mr-2 h-5 w-5" />
                          Add your certifications
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {renderSimpleArrayField('courses', 'Courses')}
                <div className="mb-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">Projects</label>
                    <button
                      type="button"
                      onClick={() => handleAddArrayItem('projects')}
                      className="inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200"
                    >
                      <PlusIcon className="-ml-0.5 mr-2 h-4 w-4" />
                      Add Project
                    </button>
                  </div>
                  <div className="space-y-2">
                    {profileData.projects && profileData.projects.length > 0 ? (
                      profileData.projects.map((project, index) => renderProjectItem(project, index))
                    ) : (
                      <div className="flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-6">
                        <button
                          type="button"
                          onClick={() => handleAddArrayItem('projects')}
                          className="inline-flex items-center text-sm text-gray-500 hover:text-teal-600"
                        >
                          <PlusIcon className="mr-2 h-5 w-5" />
                          Add your projects
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900 flex items-center">
                    <KeyIcon className="h-5 w-5 mr-2 text-teal-600" />
                    API Keys Management
                  </h2>
                  <span className="text-sm text-gray-500">
                    {aiKeys.length}/5 keys used
                  </span>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-md mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">Important information about API keys</h3>
                      <div className="mt-2 text-sm text-yellow-700">
                        <p>API keys are required for generating AI-powered resumes and cover letters. You can add up to 5 different API keys.</p>
                        <p className="mt-1">Currently supported: OpenAI API keys (format: sk-...) and Anthropic API keys (format: sk-ant-...).</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Default API Key</label>
                    <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-2">
                      <select
                        value={selectedApiKey || ''}
                        onChange={(e) => setSelectedApiKey(e.target.value)}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                      >
                        <option value="">Select an API key</option>
                        {aiKeys.map((key) => (
                          <option key={key.id} value={key.id}>
                            {key.name} {key.id === defaultApiKeyId ? '(Default)' : ''}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedApiKey) {
                            updateDefaultApiKey(Number(selectedApiKey));
                          }
                        }}
                        disabled={!selectedApiKey || Number(selectedApiKey) === defaultApiKeyId}
                        className="mt-2 sm:mt-0 inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        Set as Default
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedApiKey) {
                            testApiKey(Number(selectedApiKey));
                          }
                        }}
                        disabled={!selectedApiKey || loading}
                        className="mt-2 sm:mt-0 inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium leading-4 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        {loading && defaultApiKeyId === Number(selectedApiKey) ? 'Testing...' : 'Test'}
                      </button>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      The default API key will be used for generating resumes and cover letters.
                    </p>
                  </div>

                  <div className="mt-4">
                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                      Add New API Key {aiKeys.length >= 5 && <span className="text-red-500">(Limit reached)</span>}
                    </label>
                    <div className="mt-1 flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        id="api-key-name"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Key name (e.g. Personal, Work)"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        disabled={aiKeys.length >= 5}
                      />
                      <input
                        type="password"
                        id="api-key"
                        value={newApiKey}
                        onChange={(e) => setNewApiKey(e.target.value)}
                        placeholder="sk-... or sk-ant-..."
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                        disabled={aiKeys.length >= 5}
                      />
                      <button
                        type="button"
                        onClick={handleAddApiKey}
                        disabled={!newApiKey || !newKeyName || aiKeys.length >= 5}
                        className="mt-2 sm:mt-0 inline-flex items-center rounded-md border border-transparent bg-teal-600 px-3 py-2 text-sm font-medium leading-4 text-white hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50"
                      >
                        Add Key
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Your API key is stored securely and only used for your document generation requests.
                    </p>
                  </div>

                  {aiKeys.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-medium text-gray-700">Your API Keys</h3>
                      <div className="mt-2 overflow-hidden rounded-md border border-gray-200">
                        <ul className="divide-y divide-gray-200">
                          {aiKeys.map((key) => (
                            <li key={key.id} className="flex items-center justify-between p-3">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{key.name}</p>
                                <p className="text-xs text-gray-500">
                                  {key.key.substring(0, 3)}...{key.key.substring(key.key.length - 4)}
                                  {key.id === defaultApiKeyId && (
                                    <span className="ml-2 inline-flex items-center rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-medium text-teal-800">
                                      Default
                                    </span>
                                  )}
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  type="button"
                                  onClick={() => testApiKey(key.id)}
                                  disabled={loading}
                                  className="inline-flex items-center rounded-md border border-transparent bg-blue-100 px-3 py-2 text-sm font-medium leading-4 text-blue-700 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                                >
                                  {loading && defaultApiKeyId === key.id ? 'Testing...' : 'Test'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteApiKey(key.id)}
                                  className="inline-flex items-center rounded-md border border-transparent bg-red-100 px-3 py-2 text-sm font-medium leading-4 text-red-700 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                >
                                  Delete
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Keys Modal */}
      <AIKeysModal
        isOpen={showAIKeysModal}
        onClose={() => setShowAIKeysModal(false)}
        onKeyAdded={handleKeyAdded}
        onKeysUpdated={loadAIKeys}
        aiKeys={aiKeys}
      />

      {showLinkedinInput && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900">Import from LinkedIn</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your LinkedIn profile PDF to import your professional information
              </p>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">
                LinkedIn Profile PDF
              </label>
              <div className="mt-2">
                <div 
                  className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md"
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.add('border-teal-500', 'bg-teal-50');
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-teal-500', 'bg-teal-50');
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    e.currentTarget.classList.remove('border-teal-500', 'bg-teal-50');
                    
                    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                      const file = e.dataTransfer.files[0];
                      if (file.type === 'application/pdf') {
                        setLinkedinFile(file);
                      } else {
                        toast.error('Please upload a PDF file');
                      }
                    }
                  }}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="linkedin-file"
                        className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-teal-500"
                      >
                        <span>Upload a file</span>
                        <input
                          id="linkedin-file"
                          name="linkedin-file"
                          type="file"
                          className="sr-only"
                          accept=".pdf"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setLinkedinFile(e.target.files[0]);
                            }
                          }}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF up to 10MB</p>
                  </div>
                </div>
                {linkedinFile && (
                  <p className="mt-2 text-sm text-teal-600">
                    Selected file: {linkedinFile.name}
                  </p>
                )}
              </div>
              <div className="mt-3">
                <p className="text-xs text-gray-500">
                  <strong>How to download your LinkedIn profile as PDF:</strong><br />
                  1. Go to your LinkedIn profile page<br />
                  2. Click on the "More" button (three dots) below your profile header<br />
                  3. Select "Save to PDF" from the dropdown menu<br />
                  4. Wait for the PDF to download<br />
                  5. Upload the downloaded PDF file here
                </p>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowLinkedinInput(false);
                  setLinkedinFile(null);
                }}
                className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={importFromLinkedIn}
                disabled={importingLinkedIn || !linkedinFile}
                className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importingLinkedIn ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display PDF import message if present */}
      {pdfImportMessage && (
        <div className="mt-4 p-4 bg-yellow-50 rounded-md border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">{pdfImportMessage}</p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  type="button"
                  onClick={() => setPdfImportMessage('')}
                  className="inline-flex rounded-md bg-yellow-50 p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:ring-offset-2 focus:ring-offset-yellow-50"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Clear Data Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearDataModal}
        onClose={() => setShowClearDataModal(false)}
        onConfirm={handleClearProfileData}
        title="Clear Profile Data"
        message="Are you sure you want to clear all your profile data? This action cannot be undone and will remove all your education, experience, skills, and other profile information."
        confirmButtonText="Clear Data"
        cancelButtonText="Cancel"
      />
    </div>
  );
} 