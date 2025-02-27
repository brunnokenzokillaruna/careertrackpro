import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { toast } from 'react-hot-toast';
import { DocumentTextIcon, DocumentDuplicateIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { JobApplication } from '@/lib/types';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { marked } from 'marked';

// Add font for PDF
import 'jspdf/dist/polyfills.es.js';

interface GenerateDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: JobApplication;
  initialJobDescription?: string;
  language?: string;
  autoGenerate?: boolean;
}

interface ProfileData {
  fullName: string;
  education: any[];
  experience: any[];
  skills: string[];
  courses: string[];
  languages: string[];
  projects: any[];
  certifications: any[];
  summary: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  portfolio?: string;
}

interface AIKey {
  id: number;
  name: string;
  key: string;
}

export default function GenerateDocsModal({ 
  isOpen, 
  onClose, 
  application, 
  initialJobDescription = '',
  language = 'english',
  autoGenerate = false
}: GenerateDocsModalProps) {
  const [jobDescription, setJobDescription] = useState(initialJobDescription);
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [generatedResume, setGeneratedResume] = useState<string | null>(null);
  const [generatedCoverLetter, setGeneratedCoverLetter] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'resume' | 'coverLetter'>('resume');
  const [aiKeys, setAIKeys] = useState<AIKey[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [defaultKeyId, setDefaultKeyId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [generationStatus, setGenerationStatus] = useState('');
  const [docsGenerated, setDocsGenerated] = useState(false);
  const [resumeContent, setResumeContent] = useState<string | null>(null);
  const [coverLetterContent, setCoverLetterContent] = useState<string | null>(null);
  
  // Helper function to safely render content that might be an object
  const safeRender = (content: any): string => {
    if (content === null || content === undefined) {
      return '';
    }
    if (typeof content === 'string') {
      return content;
    }
    try {
      return String(content);
    } catch (e) {
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setGeneratedResume(null);
      setGeneratedCoverLetter(null);
      setResumeContent(null);
      setCoverLetterContent(null);
      setDocsGenerated(false);
      setError('');
      setGenerationStatus('');
      
      // Create an async function to load data
      const loadData = async () => {
        console.log('Loading data for GenerateDocsModal...');
        
        try {
          // Load profile data first
          await loadProfileData();
          
          // Then load AI keys
          await loadAIKeys();
          
          // Set job description from props
          if (initialJobDescription) {
            setJobDescription(initialJobDescription);
          }
          
          console.log('Data loading complete. Profile data:', profileData);
          
          // Wait for profile data to be fully loaded before auto-generating
          if (autoGenerate) {
            console.log('Auto-generate is enabled, waiting for data to be fully loaded...');
            // Add a delay to ensure state is updated
            setTimeout(() => {
              console.log('Starting auto-generation with profile data:', profileData);
              handleGenerate();
            }, 1000);
          }
        } catch (error) {
          console.error('Error loading data:', error);
          setError('Failed to load data. Please try again.');
        }
      };
      
      loadData();
    }
  }, [isOpen, application, autoGenerate, initialJobDescription]);

  const loadProfileData = async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to generate documents.');
        setLoadingProfile(false);
        return;
      }
      
      console.log('Loading profile data for user:', user.id);
      
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error loading profile data:', error);
        // Create a default profile if none exists
        const defaultProfile: ProfileData = {
          fullName: 'Your Name',
          summary: 'Professional summary not provided.',
          education: [],
          experience: [],
          skills: [],
          courses: [],
          languages: [],
          projects: [],
          certifications: [],
          email: 'your.email@example.com',
          phone: '(123) 456-7890',
          location: 'City, State'
        };
        setProfileData(defaultProfile);
        setLoadingProfile(false);
        return;
      }
      
      if (!profileData) {
        console.log('No profile data found for user:', user.id);
        // Create a default profile if none exists
        const defaultProfile: ProfileData = {
          fullName: 'Your Name',
          summary: 'Professional summary not provided.',
          education: [],
          experience: [],
          skills: [],
          courses: [],
          languages: [],
          projects: [],
          certifications: [],
          email: 'your.email@example.com',
          phone: '(123) 456-7890',
          location: 'City, State'
        };
        setProfileData(defaultProfile);
        setLoadingProfile(false);
        return;
      }
      
      console.log('Profile data loaded successfully:', profileData);
      
      // Parse JSON strings into arrays
      try {
        // Extract contact information directly from the database fields
        const email = profileData.email || '';
        const phone = profileData.phone || '';
        const location = profileData.location || '';
        const linkedin = profileData.linkedin || '';
        const portfolio = profileData.website || ''; // Use website field for portfolio
        
        console.log('Contact info from database:', { email, phone, location, linkedin, portfolio });
        
        const parsedProfile: ProfileData = {
          fullName: profileData.full_name || 'Your Name',
          summary: profileData.summary || 'Professional summary not provided.',
          education: typeof profileData.education === 'string' ? JSON.parse(profileData.education || '[]') : (profileData.education || []),
          experience: typeof profileData.experience === 'string' ? JSON.parse(profileData.experience || '[]') : (profileData.experience || []),
          skills: typeof profileData.skills === 'string' ? JSON.parse(profileData.skills || '[]') : (profileData.skills || []),
          courses: typeof profileData.courses === 'string' ? JSON.parse(profileData.courses || '[]') : (profileData.courses || []),
          languages: typeof profileData.languages === 'string' ? JSON.parse(profileData.languages || '[]') : (profileData.languages || []),
          projects: typeof profileData.projects === 'string' ? JSON.parse(profileData.projects || '[]') : (profileData.projects || []),
          certifications: typeof profileData.certifications === 'string' ? JSON.parse(profileData.certifications || '[]') : (profileData.certifications || []),
          email: email,
          phone: phone,
          location: location,
          linkedin: linkedin,
          portfolio: portfolio
        };
        
        console.log('Parsed profile data:', parsedProfile);
        setProfileData(parsedProfile);
      } catch (parseError) {
        console.error('Error parsing profile data:', parseError);
        // If parsing fails, use the raw data as much as possible
        const fallbackProfile: ProfileData = {
          fullName: profileData.full_name || 'Your Name',
          summary: profileData.summary || 'Professional summary not provided.',
          education: [],
          experience: [],
          skills: [],
          courses: [],
          languages: [],
          projects: [],
          certifications: [],
          email: profileData.email || 'your.email@example.com',
          phone: profileData.phone || '(123) 456-7890',
          location: profileData.location || 'City, State',
          linkedin: profileData.linkedin || '',
          portfolio: profileData.website || ''
        };
        setProfileData(fallbackProfile);
      }
    } catch (error) {
      console.error('Error in loadProfileData:', error);
      // Create a default profile if there's an error
      const defaultProfile: ProfileData = {
        fullName: 'Your Name',
        summary: 'Professional summary not provided.',
        education: [],
        experience: [],
        skills: [],
        courses: [],
        languages: [],
        projects: [],
        certifications: [],
        email: 'your.email@example.com',
        phone: '(123) 456-7890',
        location: 'City, State'
      };
      setProfileData(defaultProfile);
    } finally {
      setLoadingProfile(false);
    }
  };

  const loadAIKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      console.log('Loading AI keys for user:', user.id);
      
      // Load AI keys
      const { data: keys, error: keysError } = await supabase
        .from('ai_keys')
        .select('*')
        .eq('user_id', user.id);
      
      if (keysError) {
        console.error('Error loading AI keys:', keysError);
        return;
      }
      
      console.log('Loaded API keys:', keys ? keys.length : 0);
      
      if (keys && keys.length > 0) {
        setAIKeys(keys);
        setUserId(user.id);
        
        // Load user preferences to get default API key
        const { data: preferences, error: preferencesError } = await supabase
          .from('user_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (!preferencesError && preferences && preferences.default_api_key_id) {
          console.log('Found default API key ID:', preferences.default_api_key_id);
          setDefaultKeyId(preferences.default_api_key_id);
          setSelectedKeyId(preferences.default_api_key_id);
          
          // Verify that the default key exists in the keys array
          const defaultKeyExists = keys.some(key => key.id === preferences.default_api_key_id);
          if (!defaultKeyExists) {
            console.log('Default key not found in keys array, using first key instead');
            setSelectedKeyId(keys[0].id);
          }
        } else {
          // If no preference is set but we have keys, use the first one
          console.log('No default API key found, using first key:', keys[0].id);
          setSelectedKeyId(keys[0].id);
        }
        
        console.log('Loaded API keys:', keys);
      } else {
        console.log('No API keys found for user');
        setAIKeys([]);
        setSelectedKeyId(null);
        setDefaultKeyId(null);
      }
    } catch (error) {
      console.error('Error in loadAIKeys:', error);
      setAIKeys([]);
      setSelectedKeyId(null);
      setDefaultKeyId(null);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setGenerationStatus('');
    
    try {
      // Check if job description is provided
      if (!jobDescription.trim()) {
        setError('Job description is required');
        setLoading(false);
        return;
      }
      
      console.log('Selected key ID:', selectedKeyId);
      console.log('Available keys:', aiKeys);
      
      // Ensure we have profile data before proceeding
      if (!profileData) {
        console.log('Profile data not loaded yet, loading now...');
        await loadProfileData();
      }
      
      // Create a deep copy of profile data to avoid reference issues
      const currentProfileData = profileData ? JSON.parse(JSON.stringify(profileData)) : {
        fullName: 'Your Name',
        email: 'your.email@example.com',
        phone: '(123) 456-7890',
        location: 'City, State',
        linkedin: '',
        portfolio: '',
        summary: 'Professional summary not provided.',
        education: [],
        experience: [],
        skills: [],
        certifications: [],
        projects: [],
        languages: [],
        courses: []
      };
      
      // Log the profile data being used for generation
      console.log('Using profile data for document generation:', {
        fullName: currentProfileData.fullName,
        email: currentProfileData.email,
        phone: currentProfileData.phone,
        location: currentProfileData.location,
        education: Array.isArray(currentProfileData.education) ? currentProfileData.education.length : 0,
        experience: Array.isArray(currentProfileData.experience) ? currentProfileData.experience.length : 0,
        skills: Array.isArray(currentProfileData.skills) ? currentProfileData.skills.length : 0
      });
      
      // Check if we have a valid API key
      let selectedApiKey = null;
      if (selectedKeyId && aiKeys.length > 0) {
        selectedApiKey = aiKeys.find(key => key.id === selectedKeyId);
        console.log('Using API key:', selectedApiKey ? selectedApiKey.name : 'None');
      } else {
        console.log('No API key selected, proceeding with mock generation');
      }

      let resumeContent = '';
      let coverLetterContent = '';

      // Use the API key if available, otherwise use mock data
      if (selectedApiKey && selectedApiKey.key) {
        try {
          setGenerationStatus('Generating resume...');
          
          // Determine if it's an OpenAI, Anthropic, or Gemini key based on the prefix
          const isAnthropicKey = selectedApiKey.key.startsWith('sk-ant');
          const isGeminiKey = selectedApiKey.key.startsWith('AIza');
          
          if (isAnthropicKey) {
            // Use Anthropic API for resume generation
            console.log('Using Anthropic API for document generation');
            
            const resumeResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': selectedApiKey.key,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 4000,
                messages: [
                  {
                    role: 'user',
                    content: `You are an expert resume writer. Create a professional, ATS-friendly resume based on the following profile information and job description. Format it in Markdown.
                    
                    Profile Information:
                    - Name: ${currentProfileData.fullName}
                    - Email: ${currentProfileData.email || 'Not provided'}
                    - Phone: ${currentProfileData.phone || 'Not provided'}
                    - Location: ${currentProfileData.location || 'Not provided'}
                    - LinkedIn: ${currentProfileData.linkedin || 'Not provided'}
                    - Summary: ${currentProfileData.summary || 'Not provided'}
                    - Education: ${JSON.stringify(currentProfileData.education || [])}
                    - Experience: ${JSON.stringify(currentProfileData.experience || [])}
                    - Skills: ${JSON.stringify(currentProfileData.skills || [])}
                    - Certifications: ${JSON.stringify(currentProfileData.certifications || [])}
                    - Projects: ${JSON.stringify(currentProfileData.projects || [])}
                    
                    Job Description:
                    ${jobDescription}
                    
                    Create a tailored resume that highlights relevant skills and experience for this job. Format it in Markdown.`
                  }
                ]
              })
            });
            
            if (!resumeResponse.ok) {
              throw new Error(`Anthropic API error: ${resumeResponse.status}`);
            }
            
            const resumeData = await resumeResponse.json();
            resumeContent = resumeData.content[0].text;
            
            setGenerationStatus('Generating cover letter...');
            
            // Use Anthropic API for cover letter generation
            const coverLetterResponse = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': selectedApiKey.key,
                'anthropic-version': '2023-06-01'
              },
              body: JSON.stringify({
                model: 'claude-3-haiku-20240307',
                max_tokens: 4000,
                messages: [
                  {
                    role: 'user',
                    content: `You are an expert cover letter writer. Create a professional, compelling cover letter based on the following profile information and job description. Format it in Markdown.
                    
                    Profile Information:
                    - Name: ${currentProfileData.fullName}
                    - Email: ${currentProfileData.email || 'Not provided'}
                    - Phone: ${currentProfileData.phone || 'Not provided'}
                    - Location: ${currentProfileData.location || 'Not provided'}
                    - LinkedIn: ${currentProfileData.linkedin || 'Not provided'}
                    - Summary: ${currentProfileData.summary || 'Not provided'}
                    - Experience: ${JSON.stringify(currentProfileData.experience || [])}
                    - Skills: ${JSON.stringify(currentProfileData.skills || [])}
                    
                    Job Description:
                    ${jobDescription}
                    
                    Company: ${application.company || 'the company'}
                    Position: ${application.position || 'the position'}
                    
                    Create a tailored cover letter that highlights relevant skills and experience for this job. Format it in Markdown.`
                  }
                ]
              })
            });
            
            if (!coverLetterResponse.ok) {
              throw new Error(`Anthropic API error: ${coverLetterResponse.status}`);
            }
            
            const coverLetterData = await coverLetterResponse.json();
            coverLetterContent = coverLetterData.content[0].text;
          } else if (isGeminiKey) {
            // Use Gemini API for resume generation
            console.log('Using Gemini API for document generation');
            
            // Resume generation with Gemini
            const resumePrompt = `You are an expert resume writer. Create a professional, ATS-friendly resume based on the following profile information and job description. Format it in Markdown.
              
              Profile Information:
              - Name: ${currentProfileData.fullName}
              - Email: ${currentProfileData.email || 'Not provided'}
              - Phone: ${currentProfileData.phone || 'Not provided'}
              - Location: ${currentProfileData.location || 'Not provided'}
              - LinkedIn: ${currentProfileData.linkedin || 'Not provided'}
              - Summary: ${currentProfileData.summary || 'Not provided'}
              - Education: ${JSON.stringify(currentProfileData.education || [])}
              - Experience: ${JSON.stringify(currentProfileData.experience || [])}
              - Skills: ${JSON.stringify(currentProfileData.skills || [])}
              - Certifications: ${JSON.stringify(currentProfileData.certifications || [])}
              - Projects: ${JSON.stringify(currentProfileData.projects || [])}
              
              Job Description:
              ${jobDescription}
              
              Create a tailored resume that highlights relevant skills and experience for this job. Format it in Markdown.`;
            
            try {
              console.log('Calling Gemini API for resume generation...');
              const resumeResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${selectedApiKey.key}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contents: [
                    { 
                      parts: [
                        { text: resumePrompt }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                  }
                })
              });
              
              if (!resumeResponse.ok) {
                console.error(`Gemini API error for resume: ${resumeResponse.status}`);
                throw new Error(`Gemini API error: ${resumeResponse.status}`);
              }
              
              const resumeData = await resumeResponse.json();
              resumeContent = resumeData.candidates[0].content.parts[0].text;
            } catch (error) {
              console.error('Error generating resume with Gemini API:', error);
              console.log('Falling back to mock resume generation...');
              resumeContent = generateMockResume(currentProfileData, application, jobDescription);
            }
            
            setGenerationStatus('Generating cover letter...');
            
            // Cover letter generation with Gemini
            const coverLetterPrompt = `You are an expert cover letter writer. Create a professional, compelling cover letter based on the following profile information and job description. Format it in Markdown.
              
              Profile Information:
              - Name: ${currentProfileData.fullName}
              - Email: ${currentProfileData.email || 'Not provided'}
              - Phone: ${currentProfileData.phone || 'Not provided'}
              - Location: ${currentProfileData.location || 'Not provided'}
              - LinkedIn: ${currentProfileData.linkedin || 'Not provided'}
              - Summary: ${currentProfileData.summary || 'Not provided'}
              - Experience: ${JSON.stringify(currentProfileData.experience || [])}
              - Skills: ${JSON.stringify(currentProfileData.skills || [])}
              
              Job Description:
              ${jobDescription}
              
              Company: ${application.company || 'the company'}
              Position: ${application.position || 'the position'}
              
              Create a tailored cover letter that highlights relevant skills and experience for this job. Format it in Markdown.`;
            
            try {
              console.log('Calling Gemini API for cover letter generation...');
              const coverLetterResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${selectedApiKey.key}`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  contents: [
                    { 
                      parts: [
                        { text: coverLetterPrompt }
                      ]
                    }
                  ],
                  generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2048
                  }
                })
              });
              
              if (!coverLetterResponse.ok) {
                console.error(`Gemini API error for cover letter: ${coverLetterResponse.status}`);
                throw new Error(`Gemini API error: ${coverLetterResponse.status}`);
              }
              
              const coverLetterData = await coverLetterResponse.json();
              coverLetterContent = coverLetterData.candidates[0].content.parts[0].text;
            } catch (error) {
              console.error('Error generating cover letter with Gemini API:', error);
              console.log('Falling back to mock cover letter generation...');
              coverLetterContent = generateMockCoverLetter(currentProfileData, application, jobDescription);
            }
          } else {
            // Use OpenAI API for resume generation
            console.log('Using OpenAI API for document generation');
            
            const resumeResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${selectedApiKey.key}`
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: `You are an expert resume writer. Create a professional, ATS-friendly resume based on the following profile information and job description. Format it in Markdown.`
                  },
                  {
                    role: 'user',
                    content: `
                      Profile Information:
                      - Name: ${currentProfileData.fullName}
                      - Email: ${currentProfileData.email || 'Not provided'}
                      - Phone: ${currentProfileData.phone || 'Not provided'}
                      - Location: ${currentProfileData.location || 'Not provided'}
                      - LinkedIn: ${currentProfileData.linkedin || 'Not provided'}
                      - Summary: ${currentProfileData.summary || 'Not provided'}
                      - Education: ${JSON.stringify(currentProfileData.education || [])}
                      - Experience: ${JSON.stringify(currentProfileData.experience || [])}
                      - Skills: ${JSON.stringify(currentProfileData.skills || [])}
                      - Certifications: ${JSON.stringify(currentProfileData.certifications || [])}
                      - Projects: ${JSON.stringify(currentProfileData.projects || [])}
                      
                      Job Description:
                      ${jobDescription}
                      
                      Create a tailored resume that highlights relevant skills and experience for this job. Format it in Markdown.
                    `
                  }
                ],
                temperature: 0.7,
                max_tokens: 2000
              })
            });
            
            if (!resumeResponse.ok) {
              throw new Error(`API error: ${resumeResponse.status}`);
            }
            
            const resumeData = await resumeResponse.json();
            resumeContent = resumeData.choices[0].message.content;
            
            setGenerationStatus('Generating cover letter...');
            
            // Call OpenAI API to generate cover letter
            const coverLetterResponse = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${selectedApiKey.key}`
              },
              body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                  {
                    role: 'system',
                    content: `You are an expert cover letter writer. Create a professional, compelling cover letter based on the following profile information and job description. Format it in Markdown.`
                  },
                  {
                    role: 'user',
                    content: `
                      Profile Information:
                      - Name: ${currentProfileData.fullName}
                      - Email: ${currentProfileData.email || 'Not provided'}
                      - Phone: ${currentProfileData.phone || 'Not provided'}
                      - Location: ${currentProfileData.location || 'Not provided'}
                      - LinkedIn: ${currentProfileData.linkedin || 'Not provided'}
                      - Summary: ${currentProfileData.summary || 'Not provided'}
                      - Experience: ${JSON.stringify(currentProfileData.experience || [])}
                      - Skills: ${JSON.stringify(currentProfileData.skills || [])}
                      
                      Job Description:
                      ${jobDescription}
                      
                      Company: ${application.company || 'the company'}
                      Position: ${application.position || 'the position'}
                      
                      Create a tailored cover letter that highlights relevant skills and experience for this job. Format it in Markdown.
                    `
                  }
                ],
                temperature: 0.7,
                max_tokens: 2000
              })
            });
            
            if (!coverLetterResponse.ok) {
              throw new Error(`API error: ${coverLetterResponse.status}`);
            }
            
            const coverLetterData = await coverLetterResponse.json();
            coverLetterContent = coverLetterData.choices[0].message.content;
          }
          
          // Set the generated content
          setGeneratedResume(resumeContent);
          setGeneratedCoverLetter(coverLetterContent);
          setResumeContent(resumeContent);
          setCoverLetterContent(coverLetterContent);
          setDocsGenerated(true);
          
        } catch (apiError: any) {
          console.error('Error calling API:', apiError);
          toast.error(`Error generating documents with API: ${apiError.message}. Falling back to mock generation.`);
          
          // Fall back to mock generation
          resumeContent = generateMockResume(currentProfileData, application, jobDescription);
          coverLetterContent = generateMockCoverLetter(currentProfileData, application, jobDescription);
          
          setGeneratedResume(resumeContent);
          setGeneratedCoverLetter(coverLetterContent);
          setResumeContent(resumeContent);
          setCoverLetterContent(coverLetterContent);
          setDocsGenerated(true);
        }
      } else {
        console.log('No API key available, using mock generation');
        // No API key available, use mock generation
        setGenerationStatus('Generating documents with mock data...');
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        resumeContent = generateMockResume(currentProfileData, application, jobDescription);
        coverLetterContent = generateMockCoverLetter(currentProfileData, application, jobDescription);
        
        setGeneratedResume(resumeContent);
        setGeneratedCoverLetter(coverLetterContent);
        setResumeContent(resumeContent);
        setCoverLetterContent(coverLetterContent);
        setDocsGenerated(true);
      }
      
      toast.success('Documents generated successfully!');
      
    } catch (error) {
      console.error('Error generating documents:', error);
      setError('Failed to generate documents. Please try again.');
    } finally {
      setLoading(false);
      setGenerationStatus('');
    }
  };

  // Format education items for resume
  const formatEducation = (education: any[]) => {
    console.log('Formatting education:', education);
    if (!education || !Array.isArray(education) || education.length === 0) {
      return 'No education information provided.';
    }
    
    return education.map(edu => {
      if (!edu) return '';
      
      const institution = edu.institution || '';
      const degree = edu.degree || '';
      const field = edu.field || '';
      const startDate = edu.startDate || '';
      const endDate = edu.endDate || '';
      
      return `${degree} in ${field}, ${institution} (${startDate}-${endDate})`;
    }).filter(Boolean).join('\n');
  };

  // Format experience items for resume
  const formatExperience = (experience: any[]) => {
    console.log('Formatting experience:', experience);
    if (!experience || !Array.isArray(experience) || experience.length === 0) {
      return 'No work experience provided.';
    }
    
    return experience.map(exp => {
      if (!exp) return '';
      
      const company = exp.company || '';
      const title = exp.title || '';
      const startDate = exp.startDate || '';
      const endDate = exp.endDate || '';
      const description = exp.description || '';
      
      return `${title} at ${company} (${startDate}-${endDate})\n${description}`;
    }).filter(Boolean).join('\n\n');
  };

  // Format skills for resume
  const formatSkills = (skills: string[]) => {
    console.log('Formatting skills:', skills);
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return 'No skills provided.';
    }
    return skills.filter(Boolean).join(', ');
  };

  // Format certifications for resume
  const formatCertifications = (certifications: any[]) => {
    console.log('Formatting certifications:', certifications);
    if (!certifications || !Array.isArray(certifications) || certifications.length === 0) {
      return 'No certifications provided.';
    }
    
    return certifications.map(cert => {
      if (!cert) return '';
      
      const name = cert.name || '';
      const issuer = cert.issuer || '';
      const date = cert.date || '';
      
      return `${name} - ${issuer} (${date})`;
    }).filter(Boolean).join('\n');
  };

  // Format projects for resume
  const formatProjects = (projects: any[]) => {
    console.log('Formatting projects:', projects);
    if (!projects || !Array.isArray(projects) || projects.length === 0) {
      return 'No projects provided.';
    }
    
    return projects.map(proj => {
      if (!proj) return '';
      
      const name = proj.name || '';
      const technologies = proj.technologies || '';
      const description = proj.description || '';
      
      return `${name} (${technologies})\n${description}`;
    }).filter(Boolean).join('\n\n');
  };

  const generateMockResume = (profile: ProfileData, application: JobApplication, jobDesc: string) => {
    // Log the profile data being used for resume generation
    console.log('Generating resume with profile data:', {
      fullName: profile?.fullName,
      email: profile?.email,
      phone: profile?.phone,
      location: profile?.location,
      linkedin: profile?.linkedin,
      portfolio: profile?.portfolio,
      summary: profile?.summary?.substring(0, 50) + '...',
      education: Array.isArray(profile?.education) ? profile.education.length : 0,
      experience: Array.isArray(profile?.experience) ? profile.experience.length : 0,
      skills: Array.isArray(profile?.skills) ? profile.skills.length : 0
    });
    
    // Safely extract profile information with null checks
    const fullName = profile?.fullName || 'Your Name';
    const summary = profile?.summary || 'Professional summary not provided.';
    const email = profile?.email || 'your.email@example.com';
    const phone = profile?.phone || '(123) 456-7890';
    const location = profile?.location || 'City, State';
    const linkedin = profile?.linkedin || '';
    const portfolio = profile?.portfolio || '';
    
    // Log the extracted contact information
    console.log('Contact information for resume:', { fullName, email, phone, location, linkedin, portfolio });
    
    // Ensure arrays are valid before formatting
    const education = formatEducation(Array.isArray(profile?.education) ? profile.education : []);
    const experience = formatExperience(Array.isArray(profile?.experience) ? profile.experience : []);
    const skills = formatSkills(Array.isArray(profile?.skills) ? profile.skills : []);
    const certifications = formatCertifications(Array.isArray(profile?.certifications) ? profile.certifications : []);
    const projects = formatProjects(Array.isArray(profile?.projects) ? profile.projects : []);
    const languages = Array.isArray(profile?.languages) && profile.languages.length > 0 
      ? profile.languages.join(', ') 
      : 'No languages provided.';
    const courses = Array.isArray(profile?.courses) && profile.courses.length > 0 
      ? profile.courses.join(', ') 
      : 'No courses provided.';
    
    // Extract keywords from job description
    const keywordsFromJobDesc = extractKeywords(jobDesc);
    const keywordsList = keywordsFromJobDesc.length > 0 
      ? `## RELEVANT KEYWORDS\n${keywordsFromJobDesc.join(', ')}\n\n` 
      : '';
    
    // Translate section titles based on language
    const sectionTitles = getTranslatedSectionTitles(language);
    
    // Create an ATS-friendly resume format with improved design
    return `# ${fullName}

## CONTACT INFORMATION
${email}
${phone}
${location}
${linkedin ? `LinkedIn: ${linkedin}` : ''}
${portfolio ? `Portfolio: ${portfolio}` : ''}

## PROFESSIONAL SUMMARY
${summary}

${keywordsList}## WORK EXPERIENCE
${experience}

## EDUCATION
${education}

## SKILLS
${skills}

## CERTIFICATIONS
${certifications}

## PROJECTS
${projects}

## LANGUAGES
${languages}

## ADDITIONAL COURSES
${courses}

---
*This resume was tailored for ${application.position} at ${application.company}*
`;
  };

  const generateMockCoverLetter = (profile: ProfileData, application: JobApplication, jobDesc: string) => {
    // Log the profile data being used for cover letter generation
    console.log('Generating cover letter with profile data:', {
      fullName: profile?.fullName,
      email: profile?.email,
      phone: profile?.phone,
      location: profile?.location,
      linkedin: profile?.linkedin,
      portfolio: profile?.portfolio,
      summary: profile?.summary?.substring(0, 50) + '...',
      experience: Array.isArray(profile?.experience) ? profile.experience.length : 0,
      skills: Array.isArray(profile?.skills) ? profile.skills.length : 0
    });
    
    // Safely extract profile information with null checks
    const fullName = profile?.fullName || 'Your Name';
    const email = profile?.email || 'your.email@example.com';
    const phone = profile?.phone || '(123) 456-7890';
    const location = profile?.location || 'City, State';
    
    // Log the extracted contact information
    console.log('Contact information for cover letter:', { fullName, email, phone, location });
    
    // Get current date in format: Month Day, Year
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Extract company and position from application
    const company = application?.company || 'the company';
    const position = application?.position || 'the position';
    
    // Extract skills and experience for the letter
    const skills = Array.isArray(profile?.skills) && profile.skills.length > 0
      ? profile.skills.join(', ')
      : 'various professional skills';
    
    // Get the most recent experience if available
    let recentExperience = '';
    let recentCompany = '';
    if (Array.isArray(profile?.experience) && profile.experience.length > 0) {
      const sortedExperience = [...profile.experience].sort((a, b) => {
        const dateA = new Date(a.endDate || Date.now());
        const dateB = new Date(b.endDate || Date.now());
        return dateB.getTime() - dateA.getTime();
      });
      
      if (sortedExperience[0]) {
        recentExperience = sortedExperience[0].title || '';
        recentCompany = sortedExperience[0].company || '';
      }
    }
    
    // Extract keywords from job description
    const keywordsFromJobDesc = extractKeywords(jobDesc);
    const relevantSkills = keywordsFromJobDesc.length > 0 
      ? keywordsFromJobDesc.join(', ')
      : skills;
    
    // Translate section titles based on language
    const sectionTitles = getTranslatedSectionTitles(language);
    
    // Create a professional cover letter
    return `# ${sectionTitles.coverLetter}

${fullName}
${email}
${phone}
${location}

${currentDate}

${sectionTitles.dearHiringManager},

${sectionTitles.coverLetterIntro} ${position} ${sectionTitles.at} ${company}. ${sectionTitles.withBackground} ${relevantSkills}, ${sectionTitles.valueAddition}

${profile?.summary || sectionTitles.defaultSummary}

${recentExperience && recentCompany ? `${sectionTitles.previousRole} ${recentCompany} ${sectionTitles.developedSkills}` : ''}

${sectionTitles.excitedOpportunity} ${company} ${sectionTitles.commitmentToInnovation}

${sectionTitles.thankYou}

${sectionTitles.sincerely},
${fullName}
`;
  };

  // Helper function to get translated section titles
  const getTranslatedSectionTitles = (lang: string) => {
    const translations: Record<string, Record<string, string>> = {
      english: {
        resume: 'Resume',
        tailoredFor: 'Tailored for',
        at: 'at',
        professionalSummary: 'PROFESSIONAL SUMMARY',
        workExperience: 'WORK EXPERIENCE',
        education: 'EDUCATION',
        skills: 'SKILLS',
        certifications: 'CERTIFICATIONS',
        projects: 'PROJECTS',
        languages: 'LANGUAGES',
        additionalCourses: 'ADDITIONAL COURSES',
        noLanguages: 'No languages provided.',
        noCourses: 'No courses provided.',
        tailoredMessage: 'This resume has been tailored to match the job description for',
        coverLetter: 'Cover Letter',
        dearHiringManager: 'Dear Hiring Manager',
        coverLetterIntro: 'I am writing to express my interest in the',
        position: 'position',
        withBackground: 'With my background in',
        valueAddition: 'I believe I would be a valuable addition to your team.',
        defaultSummary: 'I am a dedicated professional with a passion for excellence.',
        previousRole: 'In my previous role at',
        developedSkills: 'I developed strong skills in problem-solving, collaboration, and delivering results.',
        excitedOpportunity: 'I am excited about the opportunity to bring my unique skills and experiences to',
        commitmentToInnovation: 'because of your commitment to innovation and excellence in the industry.',
        thankYou: 'Thank you for considering my application. I look forward to the possibility of working with you.',
        sincerely: 'Sincerely'
      },
      french: {
        resume: 'CV',
        tailoredFor: 'Adapté pour',
        at: 'chez',
        professionalSummary: 'RÉSUMÉ PROFESSIONNEL',
        workExperience: 'EXPÉRIENCE PROFESSIONNELLE',
        education: 'FORMATION',
        skills: 'COMPÉTENCES',
        certifications: 'CERTIFICATIONS',
        projects: 'PROJETS',
        languages: 'LANGUES',
        additionalCourses: 'FORMATIONS COMPLÉMENTAIRES',
        noLanguages: 'Aucune langue fournie.',
        noCourses: 'Aucun cours fourni.',
        tailoredMessage: 'Ce CV a été adapté pour correspondre à la description du poste de',
        coverLetter: 'Lettre de Motivation',
        dearHiringManager: 'Madame, Monsieur',
        coverLetterIntro: 'Je vous écris pour exprimer mon intérêt pour le poste de',
        position: '',
        withBackground: 'Avec mon expérience en',
        valueAddition: 'je pense que je serais un atout précieux pour votre équipe.',
        defaultSummary: 'Je suis un professionnel dévoué avec une passion pour l\'excellence.',
        previousRole: 'Dans mon rôle précédent chez',
        developedSkills: 'j\'ai développé de solides compétences en résolution de problèmes, collaboration et obtention de résultats.',
        excitedOpportunity: 'Je suis enthousiaste à l\'idée d\'apporter mes compétences et expériences uniques à',
        commitmentToInnovation: 'en raison de votre engagement envers l\'innovation et l\'excellence dans l\'industrie.',
        thankYou: 'Je vous remercie de considérer ma candidature. J\'attends avec impatience la possibilité de travailler avec vous.',
        sincerely: 'Cordialement'
      },
      portuguese: {
        resume: 'Currículo',
        tailoredFor: 'Adaptado para',
        at: 'na',
        professionalSummary: 'RESUMO PROFISSIONAL',
        workExperience: 'EXPERIÊNCIA PROFISSIONAL',
        education: 'FORMAÇÃO ACADÊMICA',
        skills: 'HABILIDADES',
        certifications: 'CERTIFICAÇÕES',
        projects: 'PROJETOS',
        languages: 'IDIOMAS',
        additionalCourses: 'CURSOS ADICIONAIS',
        noLanguages: 'Nenhum idioma fornecido.',
        noCourses: 'Nenhum curso fornecido.',
        tailoredMessage: 'Este currículo foi adaptado para corresponder à descrição do cargo de',
        coverLetter: 'Carta de Apresentação',
        dearHiringManager: 'Prezado(a) Recrutador(a)',
        coverLetterIntro: 'Escrevo para manifestar meu interesse na posição de',
        position: '',
        withBackground: 'Com minha experiência em',
        valueAddition: 'acredito que seria uma adição valiosa para sua equipe.',
        defaultSummary: 'Sou um profissional dedicado com paixão pela excelência.',
        previousRole: 'Em minha função anterior na',
        developedSkills: 'desenvolvi fortes habilidades em resolução de problemas, colaboração e entrega de resultados.',
        excitedOpportunity: 'Estou entusiasmado com a oportunidade de trazer minhas habilidades e experiências únicas para a',
        commitmentToInnovation: 'devido ao seu compromisso com a inovação e excelência no setor.',
        thankYou: 'Agradeço a consideração de minha candidatura. Aguardo a possibilidade de trabalhar com vocês.',
        sincerely: 'Atenciosamente'
      },
      spanish: {
        resume: 'Currículum',
        tailoredFor: 'Adaptado para',
        at: 'en',
        professionalSummary: 'RESUMEN PROFESIONAL',
        workExperience: 'EXPERIENCIA LABORAL',
        education: 'EDUCACIÓN',
        skills: 'HABILIDADES',
        certifications: 'CERTIFICACIONES',
        projects: 'PROYECTOS',
        languages: 'IDIOMAS',
        additionalCourses: 'CURSOS ADICIONALES',
        noLanguages: 'No se proporcionaron idiomas.',
        noCourses: 'No se proporcionaron cursos.',
        tailoredMessage: 'Este currículum ha sido adaptado para coincidir con la descripción del puesto de',
        coverLetter: 'Carta de Presentación',
        dearHiringManager: 'Estimado/a Responsable de Contratación',
        coverLetterIntro: 'Le escribo para expresar mi interés en el puesto de',
        position: '',
        withBackground: 'Con mi experiencia en',
        valueAddition: 'creo que sería una valiosa incorporación a su equipo.',
        defaultSummary: 'Soy un profesional dedicado con pasión por la excelencia.',
        previousRole: 'En mi puesto anterior en',
        developedSkills: 'desarrollé sólidas habilidades en resolución de problemas, colaboración y obtención de resultados.',
        excitedOpportunity: 'Estoy entusiasmado con la oportunidad de aportar mis habilidades y experiencias únicas a',
        commitmentToInnovation: 'debido a su compromiso con la innovación y la excelencia en la industria.',
        thankYou: 'Gracias por considerar mi solicitud. Espero con interés la posibilidad de trabajar con ustedes.',
        sincerely: 'Atentamente'
      },
      german: {
        resume: 'Lebenslauf',
        tailoredFor: 'Angepasst für',
        at: 'bei',
        professionalSummary: 'BERUFLICHES PROFIL',
        workExperience: 'BERUFSERFAHRUNG',
        education: 'AUSBILDUNG',
        skills: 'FÄHIGKEITEN',
        certifications: 'ZERTIFIZIERUNGEN',
        projects: 'PROJEKTE',
        languages: 'SPRACHEN',
        additionalCourses: 'ZUSÄTZLICHE KURSE',
        noLanguages: 'Keine Sprachen angegeben.',
        noCourses: 'Keine Kurse angegeben.',
        tailoredMessage: 'Dieser Lebenslauf wurde angepasst, um der Stellenbeschreibung für',
        coverLetter: 'Anschreiben',
        dearHiringManager: 'Sehr geehrte Damen und Herren',
        coverLetterIntro: 'Hiermit bewerbe ich mich für die Position als',
        position: '',
        withBackground: 'Mit meinem Hintergrund in',
        valueAddition: 'glaube ich, dass ich eine wertvolle Ergänzung für Ihr Team wäre.',
        defaultSummary: 'Ich bin ein engagierter Fachmann mit Leidenschaft für Exzellenz.',
        previousRole: 'In meiner vorherigen Position bei',
        developedSkills: 'habe ich starke Fähigkeiten in Problemlösung, Zusammenarbeit und Ergebniserzielung entwickelt.',
        excitedOpportunity: 'Ich freue mich auf die Möglichkeit, meine einzigartigen Fähigkeiten und Erfahrungen bei',
        commitmentToInnovation: 'einzubringen, aufgrund Ihres Engagements für Innovation und Exzellenz in der Branche.',
        thankYou: 'Vielen Dank für die Berücksichtigung meiner Bewerbung. Ich freue mich auf die Möglichkeit, mit Ihnen zusammenzuarbeiten.',
        sincerely: 'Mit freundlichen Grüßen'
      },
      chinese: {
        resume: '简历',
        tailoredFor: '为',
        at: '在',
        professionalSummary: '专业摘要',
        workExperience: '工作经验',
        education: '教育背景',
        skills: '技能',
        certifications: '证书',
        projects: '项目',
        languages: '语言',
        additionalCourses: '额外课程',
        noLanguages: '未提供语言信息。',
        noCourses: '未提供课程信息。',
        tailoredMessage: '此简历已针对',
        coverLetter: '求职信',
        dearHiringManager: '尊敬的招聘经理',
        coverLetterIntro: '我写信表达对',
        position: '职位的兴趣',
        withBackground: '凭借我在',
        valueAddition: '的背景，我相信我将成为您团队的宝贵补充。',
        defaultSummary: '我是一位专注的专业人士，对卓越充满热情。',
        previousRole: '在我之前在',
        developedSkills: '的角色中，我培养了解决问题、协作和交付成果的强大技能。',
        excitedOpportunity: '我很高兴有机会将我独特的技能和经验带到',
        commitmentToInnovation: '，因为您对行业创新和卓越的承诺。',
        thankYou: '感谢您考虑我的申请。我期待着与您共事的可能性。',
        sincerely: '此致'
      },
      japanese: {
        resume: '履歴書',
        tailoredFor: 'のために調整された',
        at: 'の',
        professionalSummary: '職務要約',
        workExperience: '職務経験',
        education: '学歴',
        skills: 'スキル',
        certifications: '資格',
        projects: 'プロジェクト',
        languages: '言語',
        additionalCourses: '追加コース',
        noLanguages: '言語情報は提供されていません。',
        noCourses: 'コース情報は提供されていません。',
        tailoredMessage: 'この履歴書は、',
        coverLetter: '添え状',
        dearHiringManager: '採用担当者様',
        coverLetterIntro: '私は',
        position: 'のポジションに興味を表明するために書いています',
        withBackground: '私の',
        valueAddition: 'のバックグラウンドを持って、私はあなたのチームに価値ある追加になると信じています。',
        defaultSummary: '私は卓越性に情熱を持った献身的な専門家です。',
        previousRole: '以前の',
        developedSkills: 'での役割で、問題解決、協力、結果を出すための強いスキルを開発しました。',
        excitedOpportunity: '私は自分のユニークなスキルと経験を',
        commitmentToInnovation: 'にもたらす機会に興奮しています。それは、業界でのイノベーションと卓越性へのあなたの取り組みのためです。',
        thankYou: '私の応募をご検討いただきありがとうございます。あなたと一緒に働く可能性を楽しみにしています。',
        sincerely: '敬具'
      }
    };
    
    // Default to English if the language is not supported
    return translations[lang] || translations.english;
  };

  const handleDownload = async (type: 'resume' | 'coverLetter') => {
    try {
      setGenerationStatus(`Preparing ${type === 'resume' ? 'resume' : 'cover letter'} PDF...`);
      
      // Get the content to convert
      const content = type === 'resume' 
        ? (resumeContent || generatedResume) 
        : (coverLetterContent || generatedCoverLetter);
      
      if (!content) {
        setError(`No ${type === 'resume' ? 'resume' : 'cover letter'} content to download`);
        setGenerationStatus('');
        return;
      }
      
      console.log(`Generating PDF for ${type} with content length:`, content.length);
      
      // Create a temporary div to render the markdown
      const tempDiv = document.createElement('div');
      tempDiv.className = 'markdown-body';
      tempDiv.style.padding = '20px';
      tempDiv.style.maxWidth = '800px';
      tempDiv.style.margin = '0 auto';
      tempDiv.style.backgroundColor = 'white';
      tempDiv.style.color = 'black';
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      
      try {
        // Pre-process markdown to clean up asterisks and other symbols
        let cleanedContent = content
          // Replace markdown headers with HTML
          .replace(/^# (.*$)/gm, '<h1>$1</h1>')
          .replace(/^## (.*$)/gm, '<h2>$1</h2>')
          .replace(/^### (.*$)/gm, '<h3>$1</h3>')
          // Replace markdown bold/italic with HTML - handle nested cases properly
          .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // Bold and italic
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
          // Replace markdown lists with HTML lists
          .replace(/^- (.*$)/gm, '<li>$1</li>')
          // Replace horizontal rules
          .replace(/^---+$/gm, '<hr>')
          // Replace links
          .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
        
        // Wrap list items in ul tags
        cleanedContent = cleanedContent.replace(/<li>.*?<\/li>(\s*<li>.*?<\/li>)*/g, (match) => {
          return `<ul>${match}</ul>`;
        });
        
        // Add proper spacing between sections
        cleanedContent = cleanedContent.replace(/<\/h2>\s*<li>/g, '</h2>\n<li>');
        
        // Convert to HTML using marked with specific options
        const parsedContent = await marked.parse(cleanedContent, { 
          async: true,
          gfm: true,
          breaks: true
        });
        
        tempDiv.innerHTML = parsedContent;
        
        // Apply additional styling to make the document look better
        const styleElement = document.createElement('style');
        styleElement.textContent = `
          body { font-family: Arial, sans-serif; line-height: 1.6; }
          h1 { font-size: 24pt; text-align: center; margin-bottom: 15px; }
          h2 { font-size: 14pt; margin-top: 15px; margin-bottom: 8px; border-bottom: 1px solid #ccc; }
          h3 { font-size: 12pt; margin-top: 10px; margin-bottom: 5px; }
          ul { margin-left: 20px; }
          li { margin-bottom: 5px; }
        `;
        tempDiv.appendChild(styleElement);
        
        console.log('Markdown parsed successfully');
      } catch (parseError) {
        console.error('Error parsing markdown:', parseError);
        // Fallback to basic HTML
        tempDiv.innerHTML = `<h1>${type === 'resume' ? 'Resume' : 'Cover Letter'}</h1><pre>${content}</pre>`;
      }
      
      // Append to body temporarily (needed for html2canvas)
      document.body.appendChild(tempDiv);
      
      try {
        // Create PDF with text support
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'pt',
          format: 'a4'
        });
        
        // Use html2pdf approach for better text handling
        const options = {
          margin: [40, 40, 40, 40],
          filename: `${profileData?.fullName || type}_${application?.company || ''}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            allowTaint: true
          },
          jsPDF: { unit: 'pt', format: 'a4', orientation: 'portrait' }
        };
        
        // Use html2canvas with better settings
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        });
        
        // Get canvas dimensions
        const imgWidth = 595.28; // A4 width in points (72 dpi)
        const imgHeight = 841.89; // A4 height in points (72 dpi)
        const contentWidth = canvas.width;
        const contentHeight = canvas.height;
        
        // Calculate the number of pages needed
        const pageCount = Math.ceil(contentHeight / canvas.width * imgWidth / imgHeight);
        
        console.log(`Content requires ${pageCount} pages`);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        // Add image to PDF with proper scaling
        let position = 0;
        
        // Calculate proper scaling to fit width
        const ratio = imgWidth / contentWidth;
        const scaledHeight = contentHeight * ratio;
        
        // Add first page
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, scaledHeight);
        
        // Add additional pages if needed
        let heightLeft = scaledHeight - imgHeight;
        
        while (heightLeft > 0) {
          position = -imgHeight * (scaledHeight / contentHeight);
          pdf.addPage();
          pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, scaledHeight);
          heightLeft -= imgHeight;
          position -= imgHeight;
        }
        
        // Generate filename
        const filename = type === 'resume' 
          ? `${profileData?.fullName || 'Resume'}_${application?.company || ''}_${new Date().toISOString().split('T')[0]}.pdf`
          : `${profileData?.fullName || 'CoverLetter'}_${application?.company || ''}_${new Date().toISOString().split('T')[0]}.pdf`;
        
        // Clean up filename
        const cleanFilename = filename.replace(/[^a-zA-Z0-9_\-\.]/g, '_');
        
        console.log('Saving PDF as:', cleanFilename);
        
        // Save PDF
        pdf.save(cleanFilename);
        
        // Log success
        console.log(`${type === 'resume' ? 'Resume' : 'Cover letter'} PDF downloaded successfully`);
        toast.success(`${type === 'resume' ? 'Resume' : 'Cover letter'} downloaded successfully!`);
      } catch (pdfError) {
        console.error('Error generating PDF:', pdfError);
        throw pdfError;
      } finally {
        // Clean up
        if (document.body.contains(tempDiv)) {
          document.body.removeChild(tempDiv);
        }
        setGenerationStatus('');
      }
    } catch (error) {
      console.error(`Error generating ${type} PDF:`, error);
      setError(`Failed to generate ${type === 'resume' ? 'resume' : 'cover letter'} PDF. Please try again.`);
      setGenerationStatus('');
      toast.error(`Failed to generate PDF. Please try again.`);
    }
  };

  // Helper function to extract keywords from job description
  const extractKeywords = (jobDesc: string): string[] => {
    if (!jobDesc) return [];
    
    // Common technical skills and keywords that are valuable for ATS
    const commonKeywords = [
      'JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML', 'CSS', 'SQL', 'Python',
      'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go', 'Rust',
      'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'CI/CD', 'Git',
      'Agile', 'Scrum', 'Kanban', 'Project Management', 'Team Leadership',
      'Data Analysis', 'Machine Learning', 'AI', 'Artificial Intelligence',
      'UI/UX', 'Design', 'Figma', 'Adobe', 'Photoshop', 'Illustrator',
      'Communication', 'Problem Solving', 'Critical Thinking', 'Collaboration',
      'DevOps', 'Testing', 'QA', 'Quality Assurance', 'Security', 'Performance',
      'Mobile Development', 'Web Development', 'Full Stack', 'Frontend', 'Backend',
      'Database', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle', 'NoSQL',
      'REST API', 'GraphQL', 'Microservices', 'Architecture', 'System Design',
      'Analytics', 'SEO', 'Marketing', 'Content', 'Social Media', 'Digital Marketing',
      'Sales', 'Customer Service', 'Support', 'Account Management', 'Business Development',
      'Finance', 'Accounting', 'HR', 'Human Resources', 'Recruitment', 'Talent Acquisition',
      'Operations', 'Supply Chain', 'Logistics', 'Manufacturing', 'Engineering',
      'Product Management', 'Product Development', 'Research', 'Innovation'
    ];
    
    // Find matches in the job description
    const matches: string[] = [];
    
    // Safely check each keyword
    commonKeywords.forEach(keyword => {
      try {
        // Escape special regex characters to avoid errors
        const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Create a word boundary regex pattern
        const pattern = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
        
        if (pattern.test(jobDesc) && !matches.includes(keyword)) {
          matches.push(keyword);
        }
      } catch (error) {
        console.error(`Error checking keyword "${keyword}":`, error);
      }
    });
    
    // Add any specific skills from the profile that match the job description
    if (profileData && profileData.skills) {
      profileData.skills.forEach(skill => {
        try {
          // Escape special regex characters
          const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          
          // Create a word boundary regex pattern
          const pattern = new RegExp(`\\b${escapedSkill}\\b`, 'i');
          
          if (pattern.test(jobDesc) && !matches.includes(skill)) {
            matches.push(skill);
          }
        } catch (error) {
          console.error(`Error checking skill "${skill}":`, error);
        }
      });
    }
    
    return matches;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-4xl transform rounded-lg bg-white p-6 shadow-xl transition-all">
          {/* Close button - keep only this one */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-xl font-semibold text-gray-900">Generate Resume & Cover Letter</h2>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              For {safeRender(application.position)} at {safeRender(application.company)}
            </h3>
          </div>

          {loadingProfile ? (
            <div className="mt-6 text-center py-4">
              <ArrowPathIcon className="h-8 w-8 mx-auto animate-spin text-teal-600" />
              <p className="mt-2 text-sm text-gray-500">Loading your profile data...</p>
            </div>
          ) : (
            <>
              <div className="mt-6 grid grid-cols-1 gap-y-6">
                {!docsGenerated && (
                  <>
                    <div>
                      <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700">
                        Job Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="jobDescription"
                          name="jobDescription"
                          rows={5}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                          placeholder="Paste the job description here..."
                          value={jobDescription}
                          onChange={(e) => setJobDescription(e.target.value)}
                        />
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        This will be used to tailor your resume and cover letter to the job requirements.
                      </p>
                    </div>

                    {/* API Key selection */}
                    {aiKeys.length > 0 && (
                      <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                          Select API Key
                        </label>
                        <select
                          id="apiKey"
                          name="apiKey"
                          className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                          value={selectedKeyId || ''}
                          onChange={(e) => setSelectedKeyId(Number(e.target.value) || null)}
                        >
                          {aiKeys.map((key) => (
                            <option key={key.id} value={key.id}>
                              {key.name} {key.id === defaultKeyId ? '(Default)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* API Key status message */}
                    {aiKeys.length > 0 ? (
                      <div className="mt-1 text-xs text-gray-500">
                        Using {selectedKeyId === defaultKeyId ? 'your default' : 'selected'} API key for document generation.
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-gray-500">
                        No API keys found. Documents will be generated using mock data.
                      </div>
                    )}
                  </>
                )}

                {/* Error message */}
                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generation status */}
                {generationStatus && (
                  <div className="rounded-md bg-blue-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <ArrowPathIcon className="h-5 w-5 text-blue-400 animate-spin" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-blue-700">{generationStatus}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generate button */}
                <div className="flex justify-end">
                  {!docsGenerated ? (
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={loading}
                      className="inline-flex justify-center rounded-md border border-transparent bg-teal-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      {loading ? (
                        <>
                          <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Documents'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setDocsGenerated(false);
                        setGeneratedResume(null);
                        setGeneratedCoverLetter(null);
                        setResumeContent(null);
                        setCoverLetterContent(null);
                      }}
                      className="inline-flex justify-center rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    >
                      Generate New Documents
                    </button>
                  )}
                </div>
              </div>

              {/* Document display */}
              {docsGenerated && (generatedResume || generatedCoverLetter || resumeContent || coverLetterContent) && (
                <div className="mt-8">
                  <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                      <button
                        onClick={() => setActiveTab('resume')}
                        className={`${
                          activeTab === 'resume'
                            ? 'border-teal-500 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Resume
                      </button>
                      <button
                        onClick={() => setActiveTab('coverLetter')}
                        className={`${
                          activeTab === 'coverLetter'
                            ? 'border-teal-500 text-teal-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                      >
                        Cover Letter
                      </button>
                    </nav>
                  </div>

                  <div className="mt-4">
                    {activeTab === 'resume' && (generatedResume || resumeContent) && (
                      <div className="relative">
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => handleDownload('resume')}
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <DocumentTextIcon className="h-5 w-5 mr-1" />
                            Download PDF
                          </button>
                        </div>
                        <pre className="mt-2 p-4 bg-gray-50 rounded-md overflow-auto text-sm text-gray-800 h-96">
                          {resumeContent || generatedResume}
                        </pre>
                      </div>
                    )}

                    {activeTab === 'coverLetter' && (generatedCoverLetter || coverLetterContent) && (
                      <div className="relative">
                        <div className="absolute top-2 right-2 flex space-x-2">
                          <button
                            onClick={() => handleDownload('coverLetter')}
                            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                          >
                            <DocumentDuplicateIcon className="h-5 w-5 mr-1" />
                            Download PDF
                          </button>
                        </div>
                        <pre className="mt-2 p-4 bg-gray-50 rounded-md overflow-auto text-sm text-gray-800 h-96">
                          {coverLetterContent || generatedCoverLetter}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 