import AuthGuard from '@/components/auth/AuthGuard';

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
