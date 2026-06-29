import AuthGuard from '@/components/auth/AuthGuard';

export default function NewsLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
