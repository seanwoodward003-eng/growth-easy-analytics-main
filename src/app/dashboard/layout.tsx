import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  // Client wrapper to access pathname (required for conditional padding)
  return (
    <ClientWrapper>
      {children}
    </ClientWrapper>
  );
}

// Client component to read pathname
'use client';
import { ReactNode } from 'react';

function ClientWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isCoachPage = pathname === '/dashboard/ai-growth-coach';

  return (
    <main className={isCoachPage ? '' : 'pt-32 px-6 pb-40'}>
      {children}
    </main>
  );
}