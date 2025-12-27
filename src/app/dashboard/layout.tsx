// app/(dashboard)/layout.tsx
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AICoach } from '@/components/AICoach';  // Your AI chat component

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  return (
    <>
      {children}

      {/* AI Chat Coach — appears on every dashboard page */}
      <AICoach />

      {/* Optional: Action Zone if you want it here too */}
      {/* ... your Action Zone code ... */}
    </>
  );
}