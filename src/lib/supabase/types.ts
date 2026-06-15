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
  created_at: string
  updated_at: string
}

export interface StudentResult {
  id: string
  student_name: string
  photo_url?: string
  university_id?: string
  scholarship_id?: string
  degree_level: 'bachelor' | 'master' | 'phd'
  year: number
  country: string
  testimonial?: string
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

export interface Inquiry {
  id: string
  name: string
  phone: string
  email?: string
  message?: string
  source: string
  status: 'new' | 'contacted' | 'converted' | 'closed'
  locale: string
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
