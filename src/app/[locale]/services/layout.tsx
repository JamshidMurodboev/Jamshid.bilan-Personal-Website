import AuthGuard from '@/components/auth/AuthGuard';

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
