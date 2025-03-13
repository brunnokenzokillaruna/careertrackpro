import { useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { ProfileData } from '../types';
import toast from 'react-hot-toast';

export const useDocumentGeneration = () => {
  const [resumeContent, setResumeContent] = useState<string>('');
  const [coverLetterContent, setCoverLetterContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Function to clean AI-generated content using line-by-line processing
  const cleanAIGeneratedContent = (content: string): string => {
    if (!content) return '';
    
    try {
      // Split into lines and process each line
      const lines = content.split('\n');
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
      return content; // Return original content if processing fails
    }
  };

  const generateDocuments = async (
    profile: ProfileData,
    application: any,
    jobDescription: string,
    selectedKeyId: number | null
  ) => {
    setIsGenerating(true);
    
    try {
      // Generate plain text documents without markdown
      let resume = generatePlainTextResume(profile, application, jobDescription);
      let coverLetter = generatePlainTextCoverLetter(profile, application, jobDescription);
      
      // Clean the content to remove any markdown artifacts
      resume = cleanAIGeneratedContent(resume);
      coverLetter = cleanAIGeneratedContent(coverLetter);
      
      setResumeContent(resume);
      setCoverLetterContent(coverLetter);
      
      // Save the documents to Supabase if we have an application ID
      if (application?.id) {
        await saveDocuments(resume, coverLetter, application.id);
      }
      
      toast.success('Documents generated successfully!');
    } catch (error) {
      console.error('Error generating documents:', error);
      toast.error('Failed to generate documents. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePlainTextResume = (profile: ProfileData, application: any, jobDesc: string) => {
    // Create contact section
    const contactInfo = [
      profile.fullName,
      profile.location,
      profile.phone,
      profile.email,
      profile.linkedin
    ].filter(Boolean).join(' | ');

    // Build resume sections
    const sections = [];
    
    // Contact information
    sections.push(contactInfo);
    sections.push('');
    
    // Summary
    sections.push('SUMMARY');
    sections.push(profile.summary || 'Experienced professional with a track record of success.');
    sections.push('');
    
    // Skills
    sections.push('SKILLS');
    if (profile.skills && profile.skills.length > 0) {
      sections.push(profile.skills.join(', '));
    } else {
      sections.push('No skills provided.');
    }
    sections.push('');
    
    // Experience
    sections.push('EXPERIENCE');
    if (profile.experience && profile.experience.length > 0) {
      profile.experience.forEach(exp => {
        const company = exp.company || '';
        const title = exp.title || '';
        const startDate = exp.startDate || '';
        const endDate = exp.endDate || 'Present';
        const description = exp.description || '';
        
        sections.push(`${title} at ${company} (${startDate} - ${endDate})`);
        sections.push(description);
        sections.push('');
      });
    } else {
      sections.push('No experience provided.');
      sections.push('');
    }
    
    // Education
    sections.push('EDUCATION');
    if (profile.education && profile.education.length > 0) {
      profile.education.forEach(edu => {
        const institution = edu.institution || '';
        const degree = edu.degree || '';
        const field = edu.field || '';
        const startDate = edu.startDate || '';
        const endDate = edu.endDate || '';
        
        sections.push(`${degree} in ${field}, ${institution} (${startDate} - ${endDate})`);
      });
      sections.push('');
    } else {
      sections.push('No education provided.');
      sections.push('');
    }

    // Add certifications if they exist
    if (profile.certifications && profile.certifications.length > 0) {
      sections.push('CERTIFICATIONS');
      profile.certifications.forEach(cert => {
        const name = cert.name || '';
        const issuer = cert.issuer || '';
        const date = cert.date || '';
        
        sections.push(`${name} - ${issuer} (${date})`);
      });
      sections.push('');
    }

    // Add projects if they exist
    if (profile.projects && profile.projects.length > 0) {
      sections.push('PROJECTS');
      profile.projects.forEach(proj => {
        const name = proj.name || '';
        const technologies = proj.technologies || '';
        const description = proj.description || '';
        
        sections.push(`${name} (${technologies})`);
        sections.push(description);
        sections.push('');
      });
    }

    return sections.join('\n');
  };

  const generatePlainTextCoverLetter = (profile: ProfileData, application: any, jobDesc: string) => {
    // Get current date in Month Day, Year format
    const currentDate = new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Create contact section
    const contactInfo = [
      profile.fullName,
      profile.location,
      profile.phone,
      profile.email,
      profile.linkedin
    ].filter(Boolean).join(' | ');

    // Get company and position
    const company = application?.company || '[Company Name]';
    const position = application?.position || '[Position]';

    // Get first three skills for personalization
    const topSkills = profile.skills?.slice(0, 3).join(', ') || 'relevant skills';

    // Build cover letter sections
    const sections = [];
    
    // Contact information
    sections.push(contactInfo);
    sections.push('');
    
    // Date
    sections.push(currentDate);
    sections.push('');
    
    // Recipient
    sections.push('Dear Hiring Team,');
    sections.push('');
    
    // Subject line
    sections.push(`Re: Application for ${position} position at ${company}`);
    sections.push('');
    
    // Introduction
    sections.push(`I am writing to express my interest in the ${position} position at ${company}. With my background and expertise in ${topSkills}, I am confident that I would be a valuable addition to your team.`);
    sections.push('');
    
    // Body
    sections.push('Throughout my career, I have developed strong skills in problem-solving, communication, and collaboration. My experience has prepared me to take on challenging roles and deliver exceptional results.');
    sections.push('');
    sections.push('I am particularly drawn to your company because of its reputation for innovation and commitment to excellence. I believe that my skills and experience align well with the requirements of this position, and I am excited about the opportunity to contribute to your team.');
    sections.push('');
    
    // Closing
    sections.push('Thank you for considering my application. I look forward to the opportunity to discuss how my background and skills would benefit your organization.');
    sections.push('');
    sections.push('Sincerely,');
    sections.push('');
    sections.push(profile.fullName);

    return sections.join('\n');
  };

  const saveDocuments = async (resumeContent: string, coverLetterContent: string, applicationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Save resume
      await supabase.from('documents').upsert({
        user_id: user.id,
        application_id: applicationId,
        type: 'resume',
        content: resumeContent
      });
      
      // Save cover letter
      await supabase.from('documents').upsert({
        user_id: user.id,
        application_id: applicationId,
        type: 'cover_letter',
        content: coverLetterContent
      });
      
    } catch (error) {
      console.error('Error saving documents:', error);
      throw error;
    }
  };

  return {
    resumeContent,
    coverLetterContent,
    isGenerating,
    generateDocuments,
    setResumeContent,
    setCoverLetterContent,
    setIsGenerating
  };
}; 