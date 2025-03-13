export interface ProfileData {
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

export interface AIKey {
  id: number;
  name: string;
  key: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface ExperienceItem {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description?: string;
  location?: string;
  technologies?: string;
}

export interface ProjectItem {
  name: string;
  description: string;
  technologies: string;
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
  url?: string;
  description?: string;
} 