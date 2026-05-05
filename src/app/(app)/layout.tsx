'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

const authPaths = ['/quiz', '/review', '/profile'];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (loading) return;
    const needsAuth = authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
    if (needsAuth && !user) {
      setRedirecting(true);
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const needsAuth = authPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));
  if (needsAuth && !user) {
    return null;
  }

  return <>{children}</>;
}
