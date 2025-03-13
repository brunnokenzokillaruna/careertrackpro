export interface ProfileData {
  fullName: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  education: any[];
  experience: any[];
  skills: string[];
  courses: string[];
  languages: string[];
  projects: any[];
  certifications: any[];
  summary: string;
}

export interface GenerateDocsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

export interface DocumentFormProps {
  profile: ProfileData | null;
  jobDescription: string;
  onJobDescriptionChange: (value: string) => void;
  selectedKeyId: number | null;
  aiKeys: any[];
  onKeySelect: (keyId: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}

export interface DocumentPreviewProps {
  content: string;
  type: 'resume' | 'cover_letter';
  isGenerating: boolean;
  onDownload: () => void;
} 