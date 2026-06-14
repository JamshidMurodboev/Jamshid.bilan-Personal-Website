import { setRequestLocale } from 'next-intl/server';
import ProfileContent from '@/components/profile/ProfileContent';

export default function ProfilePage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <ProfileContent />;
}
