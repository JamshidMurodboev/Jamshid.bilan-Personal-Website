export interface MediaLink {
  url: string
  thumbnail?: string
  description_uz?: string
  description_ru?: string
  description_en?: string
}

export interface RequiredDocument {
  uz: string
  ru: string
  en: string
  mandatory?: boolean
}

export interface ScholarshipProcessStep {
  key: string
  type: 'exact' | 'month' | 'period'
  value: string
  description_uz?: string
  description_ru?: string
  description_en?: string
}

export interface Scholarship {
  id: string
  title: string
  country: string
  university?: string
  coverage: string[]
  eligibility?: string
  deadline?: string
  difficulty?: number
  tip?: string
  application_url?: string
  status: 'open' | 'closed' | 'upcoming'
  // New fields (admin overhaul)
  description_uz?: string
  description_ru?: string
  description_en?: string
  open_date?: string
  close_date?: string
  results_date?: string
  results_date_type?: 'exact' | 'month' | 'period'
  category?: 'fully_funded' | 'partially_funded' | 'self_funded'
  degrees_available?: string[]
  photo_urls?: string[]
  // Scholarship process fields
  application_period_type?: 'exact' | 'month' | 'period'
  application_period?: string
  interview_exam_period_type?: 'exact' | 'month' | 'period'
  interview_exam_period?: string
  results_period_type?: 'exact' | 'month' | 'period'
  results_period?: string
  required_documents?: RequiredDocument[]
  scholarship_process?: ScholarshipProcessStep[]
  home_order?: number
  slug?: string
  media_links?: MediaLink[]
  created_at: string
  updated_at: string
}

export interface University {
  id: string
  name: string
  name_ru?: string
  name_en?: string
  country: string
  city?: string
  logo_url?: string
  website_url?: string
  tuition_usd?: number
  type: 'public' | 'private'
  status: 'open' | 'closed' | 'upcoming'
  ranking?: number
  programs: string[]
  // New fields (admin overhaul)
  description_uz?: string
  description_ru?: string
  description_en?: string
  photo_urls?: string[]
  required_documents?: RequiredDocument[]
  home_order?: number
  slug?: string
  media_links?: MediaLink[]
  admission_start_type?: 'exact' | 'month' | 'period'
  admission_start?: string
  admission_end_type?: 'exact' | 'month' | 'period'
  admission_end?: string
  results_date_type?: 'exact' | 'month' | 'period'
  results_date?: string
  tuition_estimated?: boolean
  tuition_note_uz?: string
  tuition_note_ru?: string
  tuition_note_en?: string
  created_at: string
  updated_at: string
}

export interface UniversityMajor {
  id: string
  university_id: string
  name: string
  name_ru?: string
  name_en?: string
  language?: string
  tuition?: number
  currency: 'USD' | 'UZS' | 'EUR' | 'TL'
  degree?: 'bachelor' | 'master_thesis' | 'master_no_thesis' | 'phd'
  sort_order: number
  tuition_estimated?: boolean
  tuition_note_uz?: string
  tuition_note_ru?: string
  tuition_note_en?: string
}

export interface StudentResult {
  id: string
  student_name: string
  photo_url?: string
  photo_urls?: string[]
  university_id?: string
  scholarship_id?: string
  degree_level: 'bachelor' | 'master' | 'phd'
  year: number
  country: string
  testimonial?: string
  // New fields (admin overhaul)
  category?: 'scholarship_winner' | 'tuition_based'
  major?: string
  major_ru?: string
  major_en?: string
  language?: string
  university_ranking?: number
  university_name?: string
  university_name_ru?: string
  university_name_en?: string
  home_order?: number
  slug?: string
  media_links?: MediaLink[]
  created_at: string
}

export interface NewsPost {
  id: string
  title_uz: string
  title_ru?: string
  title_en?: string
  body_uz: string
  body_ru?: string
  body_en?: string
  cover_url?: string
  photo_urls?: string[]
  scholarship_id?: string
  university_id?: string
  published: boolean
  published_at?: string
  slug?: string
  media_links?: MediaLink[]
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  slug: string
  title_uz: string
  title_ru?: string
  title_en?: string
  excerpt_uz?: string
  body_uz: string
  body_ru?: string
  body_en?: string
  cover_url?: string
  tags: string[]
  published: boolean
  published_at?: string
  created_at: string
  updated_at: string
}

export interface Faq {
  id: string
  question_uz: string
  question_ru?: string
  question_en?: string
  answer_uz: string
  answer_ru?: string
  answer_en?: string
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Inquiry {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  source: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  locale: string
  // New fields (admin overhaul)
  notes?: string
  dob?: string
  language_certificate?: string
  grant_interest?: string
  university_interest?: string
  created_at: string
}

export interface Stat {
  id: string
  key: string
  value: string
  label_uz?: string
  label_ru?: string
  label_en?: string
  sort_order: number
}

export interface Service {
  id: string;
  name_uz: string;
  name_ru?: string;
  name_en?: string;
  description_uz?: string;
  description_ru?: string;
  description_en?: string;
  photo_url?: string;
  price?: number;
  currency?: 'USD' | 'UZS' | 'EUR' | 'TL' | 'FREE' | 'OTHER';
  currency_custom?: string;
  status?: 'active' | 'inactive';
  home_order?: number;
  slug?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  entity_type: 'scholarship' | 'university' | 'news' | 'result' | 'service';
  entity_id: string;
  created_at?: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  entity_type: string;
  entity_id: string;
  entity_name?: string;
  visited_at?: string;
}

export interface SiteUser {
  id: string
  full_name: string
  email: string
  phone?: string
  gender?: string
  dob?: string
  photo_url?: string
  telegram_chat_id?: number
  created_at: string
  last_active_at?: string
  login_count: number
  status: 'active' | 'blocked'
  language_certificate?: string
}
