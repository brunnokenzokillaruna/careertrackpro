import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { DocumentTextIcon, DocumentDuplicateIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface GenerateDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
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
}

const GenerateDocsModal: React.FC<GenerateDocsModalProps> = ({
  isOpen,
  onClose,
  application,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [jobDescription, setJobDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [resumeContent, setResumeContent] = useState('');
  const [coverLetterContent, setCoverLetterContent] = useState('');
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [aiKeys, setAiKeys] = useState<any[]>([]);
  const [selectedKeyId, setSelectedKeyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUserProfile();
      loadAIKeys();
    }
  }, [isOpen]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to generate documents');
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        toast.error('Failed to load profile data');
        return;
      }

      if (data) {
        // Parse JSON strings into arrays
        const parsedData = {
          ...data,
          education: data.education ? JSON.parse(data.education) : [],
          experience: data.experience ? JSON.parse(data.experience) : [],
          skills: data.skills ? JSON.parse(data.skills) : [],
          courses: data.courses ? JSON.parse(data.courses) : [],
          languages: data.languages ? JSON.parse(data.languages) : [],
          projects: data.projects ? JSON.parse(data.projects) : [],
          certifications: data.certifications ? JSON.parse(data.certifications) : [],
        };
        setProfile(parsedData);
      } else {
        toast.error('Please complete your profile before generating documents');
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const loadAIKeys = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_keys')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      
      if (data && data.length > 0) {
        setAiKeys(data);
        setSelectedKeyId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading AI keys:', error);
    }
  };

  const generateDocuments = async () => {
    if (!profile) {
      toast.error('Please complete your profile first');
      return;
    }

    if (!selectedKeyId && aiKeys.length > 0) {
      toast.error('Please select an API key');
      return;
    }

    setIsGenerating(true);
    try {
      // In a real application, this would call an AI service using the selected API key
      // For this demo, we'll generate mock content
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock resume and cover letter
      const resumeText = generateMockResume(profile, application, jobDescription);
      const coverLetterText = generateMockCoverLetter(profile, application, jobDescription);
      
      setResumeContent(resumeText);
      setCoverLetterContent(coverLetterText);
      
      // Save the generated documents
      await saveDocuments(resumeText, coverLetterText);
      
      toast.success('Documents generated successfully!');
    } catch (error) {
      console.error('Error generating documents:', error);
      toast.error('Failed to generate documents');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveDocuments = async (resumeContent: string, coverLetterContent: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Save resume
      const { error: resumeError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          application_id: application.id,
          type: 'resume',
          content: resumeContent
        });

      if (resumeError) throw resumeError;

      // Save cover letter
      const { error: coverLetterError } = await supabase
        .from('documents')
        .insert({
          user_id: user.id,
          application_id: application.id,
          type: 'cover_letter',
          content: coverLetterContent
        });

      if (coverLetterError) throw coverLetterError;
    } catch (error) {
      console.error('Error saving documents:', error);
      // We'll still show the generated documents even if saving fails
    }
  };

  // Format education items for resume
  const formatEducation = (education: any[]) => {
    if (!education || education.length === 0) return 'No education information provided.';
    
    return education.map(edu => {
      const institution = edu.institution || '';
      const degree = edu.degree || '';
      const field = edu.field || '';
      const startDate = edu.startDate || '';
      const endDate = edu.endDate || '';
      
      return `${degree} in ${field}, ${institution} (${startDate}-${endDate})`;
    }).join('\n');
  };

  // Format experience items for resume
  const formatExperience = (experience: any[]) => {
    if (!experience || experience.length === 0) return 'No work experience provided.';
    
    return experience.map(exp => {
      const company = exp.company || '';
      const title = exp.title || '';
      const startDate = exp.startDate || '';
      const endDate = exp.endDate || '';
      const description = exp.description || '';
      
      return `${title} at ${company} (${startDate}-${endDate})\n${description}`;
    }).join('\n\n');
  };

  // Format skills for resume
  const formatSkills = (skills: string[]) => {
    if (!skills || skills.length === 0) return 'No skills provided.';
    return skills.join(', ');
  };

  // Format certifications for resume
  const formatCertifications = (certifications: any[]) => {
    if (!certifications || certifications.length === 0) return 'No certifications provided.';
    
    return certifications.map(cert => {
      const name = cert.name || '';
      const issuer = cert.issuer || '';
      const date = cert.date || '';
      
      return `${name} - ${issuer} (${date})`;
    }).join('\n');
  };

  // Format projects for resume
  const formatProjects = (projects: any[]) => {
    if (!projects || projects.length === 0) return 'No projects provided.';
    
    return projects.map(proj => {
      const name = proj.name || '';
      const technologies = proj.technologies || '';
      const description = proj.description || '';
      
      return `${name} (${technologies})\n${description}`;
    }).join('\n\n');
  };

  const generateMockResume = (profile: ProfileData, application: any, jobDesc: string) => {
    const fullName = profile.fullName || 'Your Name';
    const summary = profile.summary || 'Professional summary not provided.';
    const education = formatEducation(profile.education);
    const experience = formatExperience(profile.experience);
    const skills = formatSkills(profile.skills);
    const certifications = formatCertifications(profile.certifications);
    const projects = formatProjects(profile.projects);
    
    return `# ${fullName} - Resume
## Tailored for ${application.position} at ${application.company}

### PROFESSIONAL SUMMARY
${summary}

### WORK EXPERIENCE
${experience}

### EDUCATION
${education}

### SKILLS
${skills}

### CERTIFICATIONS
${certifications}

### PROJECTS
${projects}

### LANGUAGES
${profile.languages ? profile.languages.join(', ') : 'No languages provided.'}

### ADDITIONAL COURSES
${profile.courses ? profile.courses.join(', ') : 'No courses provided.'}

*This resume has been tailored to match the job description for ${application.position} at ${application.company}.*
`;
  };

  const generateMockCoverLetter = (profile: ProfileData, application: any, jobDesc: string) => {
    const fullName = profile.fullName || 'Your Name';
    const company = application.company;
    const position = application.position;
    const skills = profile.skills ? profile.skills.join(', ') : '';
    const experience = profile.experience && profile.experience.length > 0 
      ? profile.experience[0].company 
      : 'my previous company';
    
    return `# Cover Letter - ${position} at ${company}

Dear Hiring Manager,

I am writing to express my interest in the ${position} position at ${company}. With my background in ${skills}, I believe I would be a valuable addition to your team.

${profile.summary || 'I am a dedicated professional with a passion for excellence.'}

In my previous role at ${experience}, I developed strong skills in problem-solving, collaboration, and delivering results. I am particularly drawn to ${company} because of your commitment to innovation and excellence in the industry.

I am excited about the opportunity to bring my unique skills and experiences to ${company} and would welcome the chance to discuss how I can contribute to your team's success.

Thank you for considering my application. I look forward to the possibility of working with you.

Sincerely,
${fullName}
`;
  };

  const handleDownload = (type: 'resume' | 'coverLetter') => {
    const content = type === 'resume' ? resumeContent : coverLetterContent;
    const filename = type === 'resume' 
      ? `Resume_${application.company}_${application.position}.md`
      : `CoverLetter_${application.company}_${application.position}.md`;
    
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-4xl transform rounded-lg bg-white p-6 shadow-xl transition-all">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Generate Documents for {application.position} at {application.company}</h3>
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="mb-4">
            <div className="mb-4 border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab(0)}
                  className={`w-1/2 border-b-2 py-4 px-1 text-center text-sm font-medium ${
                    activeTab === 0
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Generate
                </button>
                <button
                  onClick={() => setActiveTab(1)}
                  className={`w-1/2 border-b-2 py-4 px-1 text-center text-sm font-medium ${
                    activeTab === 1
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                  disabled={!resumeContent}
                >
                  View Results
                </button>
              </nav>
            </div>

            {activeTab === 0 ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
                    Job Description
                  </label>
                  <textarea
                    id="job-description"
                    rows={6}
                    className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                    placeholder="Paste the job description here to help tailor your documents..."
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                  />
                </div>

                {aiKeys.length > 0 ? (
                  <div>
                    <label htmlFor="api-key" className="block text-sm font-medium text-gray-700">
                      Select API Key
                    </label>
                    <select
                      id="api-key"
                      className="mt-1 block w-full rounded-md border border-gray-300 py-2 pl-3 pr-10 text-base focus:border-teal-500 focus:outline-none focus:ring-teal-500 sm:text-sm"
                      value={selectedKeyId || ''}
                      onChange={(e) => setSelectedKeyId(Number(e.target.value))}
                    >
                      {aiKeys.map((key) => (
                        <option key={key.id} value={key.id}>
                          {key.name}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="rounded-md bg-yellow-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path
                            fillRule="evenodd"
                            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-yellow-800">No API Keys Found</h3>
                        <div className="mt-2 text-sm text-yellow-700">
                          <p>
                            Please add an API key in your profile settings to use the document generation feature.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center rounded-md border border-transparent bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                    onClick={generateDocuments}
                    disabled={isGenerating || !profile || (aiKeys.length > 0 && !selectedKeyId)}
                  >
                    {isGenerating ? (
                      <>
                        <ArrowPathIcon className="mr-2 -ml-1 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Documents'
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {resumeContent && (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">Resume</h4>
                      <button
                        type="button"
                        onClick={() => handleDownload('resume')}
                        className="inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200"
                      >
                        <DocumentDuplicateIcon className="-ml-0.5 mr-2 h-4 w-4" /> Download
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded bg-white p-4 text-sm text-gray-800">
                      {resumeContent}
                    </div>
                  </div>
                )}

                {coverLetterContent && (
                  <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">Cover Letter</h4>
                      <button
                        type="button"
                        onClick={() => handleDownload('coverLetter')}
                        className="inline-flex items-center rounded-md border border-transparent bg-teal-100 px-3 py-2 text-sm font-medium leading-4 text-teal-700 hover:bg-teal-200"
                      >
                        <DocumentDuplicateIcon className="-ml-0.5 mr-2 h-4 w-4" /> Download
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded bg-white p-4 text-sm text-gray-800">
                      {coverLetterContent}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateDocsModal; 