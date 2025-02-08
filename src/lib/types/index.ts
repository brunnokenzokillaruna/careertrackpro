export interface User {
  id: string;
  email: string;
  name?: string;
  created_at: string;
}

export interface JobApplication {
  id: number;
  user_id: string;
  company: string;
  position: string;
  status: 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
  applied_date: string;
  notes?: string;
  job_url?: string;
  platform?: string;
  created_at: string;
  updated_at: string;
}

export interface Interview {
  id: number;
  application_id: number;
  user_id: string;
  interview_date: string;
  location?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
} 