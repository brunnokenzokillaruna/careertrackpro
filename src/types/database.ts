// Auto-generated from database schema

export interface AiKeys {
  id: string;
  user_id: string;
  provider: string;
  api_key: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Documents {
  id: string;
  user_id: string;
  title: string;
  content: string;
  type: string;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Interviews {
  id: string;
  user_id: string;
  job_application_id: string;
  date: Date | string;
  type: string;
  notes: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface JobApplications {
  id: string;
  user_id: string;
  company: string;
  position: string;
  status: string;
  applied_date: Date | string;
  notes: string | null;
  job_description: string | null;
  job_url: string | null;
  platform: string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  theme: string | null;
  notifications_enabled: boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface UserProfiles {
  id: string;
  user_id: string;
  full_name: string;
  bio: string | null;
  resume_data: Record<string, any> | null;
  created_at: Date | string;
  updated_at: Date | string;
}

export interface Users {
  id: string;
  email: string;
  created_at: Date | string;
  updated_at: Date | string;
}

