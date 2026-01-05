import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AIInsights } from '@/components/AIInsights';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/');
  }

  return <ClientLayout>{children}</ClientLayout>;
}

// Client component to check the current page
'use client';
import { usePathname } from 'next/navigation';

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Only hide insights on the full AI Growth Coach page
  const isAIGrowthCoachPage = pathname === '/dashboard/ai-growth-coach';

  return (
    <>
      {children}

      {/* AI Insights on EVERY dashboard page except the full coach */}
      {!isAIGrowthCoachPage && (
        <div className="mt-20 px-6">
          <AIInsights />
        </div>
      )}
    </>
  );
}