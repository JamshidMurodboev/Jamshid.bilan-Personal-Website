export type ScholarshipStatus = 'open' | 'closed' | 'coming_soon';
export type UniversityStatus = 'accepting' | 'closed' | 'rolling';
export type NewsCategory = 'deadline_alert' | 'personal_update' | 'study_abroad_news' | 'winner_announcement';
export type BlogCategory = 'scholarship_tips' | 'application_strategy' | 'personal_statement' | 'interview_prep' | 'country_guides';
export type PostStatus = 'draft' | 'published' | 'scheduled';
export type InquirySubject = 'scholarship' | 'university' | 'general';
export type UserRole = 'super_admin' | 'editor';

export interface Scholarship {
  id: string;
  title: string;
  country: string;
  university?: string;
  coverage: string[];
  eligibility: string;
  deadline: string;
  difficulty: number;
  tip?: string;
  application_url: string;
  status: ScholarshipStatus;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: string;
  name: string;
  country: string;
  city: string;
  tuition_min: number;
  tuition_max: number;
  currency: string;
  programs: string[];
  language_of_instruction: string;
  requirements: string;
  deadline: string;
  website_url: string;
  status: UniversityStatus;
  created_at: string;
  updated_at: string;
}

export interface StudentResult {
  id: string;
  first_name: string;
  photo_url?: string;
  award_type: 'scholarship' | 'university';
  award_name: string;
  year: number;
  quote?: string;
  country: string;
  display_order: number;
  created_at: string;
}

export interface Stats {
  id: string;
  students_helped: number;
  full_ride_winners: number;
  countries_count: number;
  years_active: number;
}

export interface NewsPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
  category: NewsCategory;
  content: string;
  status: PostStatus;
  published_at?: string;
  created_by: string;
  created_at: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  cover_image_url?: string;
  category: BlogCategory;
  content: string;
  reading_time_minutes: number;
  status: PostStatus;
  published_at?: string;
  created_by: string;
  created_at: string;
}

export interface Inquiry {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  subject: InquirySubject;
  message: string;
  is_read: boolean;
  archived: boolean;
  created_at: string;
}
