'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!document.cookie.includes('access_token')) {
      router.push('/');
    }
  }, [router]);

  return <>{children}</>;
} 