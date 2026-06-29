import AuthGuard from '@/components/auth/AuthGuard';

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
