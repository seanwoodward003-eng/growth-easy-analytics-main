import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { AIInsights } from '@/components/aiinsights';

// Client component for pathname check
'use client';
import { usePathname } from 'next/navigation';

function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAIGrowthCoachPage = pathname === '/dashboard/ai-growth-coach';

  return (
    <>
      {children}

      {/* AI Insights on all dashboard pages except the full coach page */}
      {!isAIGrowthCoachPage && (
        <div className="mt-20 px-6">
          <AIInsights />
        </div>
      )}
    </>
  );
}

// Make the layout async so we can await getCurrentUser()
export default async function DashboardLayout({
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