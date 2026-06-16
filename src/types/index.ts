export type InquirySubject = 'scholarship' | 'university' | 'general';
export type UserRole = 'super_admin' | 'editor';

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
