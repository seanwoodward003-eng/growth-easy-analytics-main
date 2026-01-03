import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AICoach } from '@/components/AICoach';

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
      <AICoach />
    </>
  );
}