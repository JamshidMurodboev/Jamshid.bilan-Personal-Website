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
  photo_urls?: string[]
  created_at: string
  updated_at: string
}

export interface University {
  id: string
  name: string
  country: string
  city?: string
  logo_url?: string
  website_url?: string
  tuition_usd?: number
  type: 'public' | 'private'
  ranking?: number
  programs: string[]
  // New fields (admin overhaul)
  description_uz?: string
  description_ru?: string
  description_en?: string
  photo_urls?: string[]
  created_at: string
  updated_at: string
}

export interface UniversityMajor {
  id: string
  university_id: string
  name: string
  language?: string
  tuition?: number
  currency: 'USD' | 'UZS' | 'EUR' | 'TL'
  sort_order: number
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
  language?: string
  university_ranking?: number
  university_name?: string
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
  published: boolean
  published_at?: string
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

export interface Testimonial {
  id: string
  quote_uz: string
  quote_ru?: string
  quote_en?: string
  student_name: string
  outcome_uz: string
  outcome_ru?: string
  outcome_en?: string
  photo_url?: string
  photo_urls?: string[]
  sort_order: number
  // New fields (admin overhaul)
  category?: 'scholarship_winner' | 'tuition_based'
  scholarship_id?: string
  university_id?: string
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

export interface SiteUser {
  id: string
  full_name: string
  email: string
  phone?: string
  gender?: string
  dob?: string
  photo_url?: string
  created_at: string
  last_active_at?: string
  login_count: number
  status: 'active' | 'blocked'
}
