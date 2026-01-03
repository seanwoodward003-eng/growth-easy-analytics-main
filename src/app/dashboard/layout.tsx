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
    <div className="flex min-h-screen">
      {/* Sidebar Nav (fixed on desktop, hidden on mobile) */}
      <aside className="hidden md:block fixed left-0 top-0 bottom-0 w-64 bg-[#0a0f2c]/95 backdrop-blur-lg border-r-4 border-cyan-400/30 p-8 z-40 overflow-y-auto">
        <div className="space-y-6 mt-32">
          <Link href="/dashboard" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            Dashboard
          </Link>
          <Link href="/dashboard/churn" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            Churn
          </Link>
          <Link href="/dashboard/revenue" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            Revenue
          </Link>
          <Link href="/dashboard/acquisition" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            Acquisition
          </Link>
          <Link href="/dashboard/retention" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            Retention
          </Link>
          <Link href="/dashboard/performance" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            Performance
          </Link>
          <Link href="/dashboard/ai-insights" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            AI Insights
          </Link>
          <Link href="/pricing" className="block text-3xl py-4 border-b border-cyan-600/50 text-cyan-300 hover:text-cyan-400">
            Upgrade
          </Link>
          <button onClick={() => { /* logout logic */ }} className="w-full text-left text-3xl text-red-400 py-4">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:pl-64 p-8 pb-40">
        {children}
      </main>

      {/* AI Coach */}
      <AICoach />
    </div>
  );
}