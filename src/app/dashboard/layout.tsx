// app/dashboard/layout.tsx

// import { getCurrentUser } from '@/lib/auth';    // commented out for public access
import { redirect } from 'next/navigation';       // can keep or comment; not used now

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const user = await getCurrentUser();         // commented out
  // if (!user) {
  //   redirect('/');
  // }

  return <>{children}</>;
}