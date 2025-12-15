// src/app/dashboard/layout.tsx
import { MobileNav } from "@/components/layout/MobileNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen pb-20 md:pb-0"> {/* pb-20 gives space for mobile bottom nav */}
      {children}
      <MobileNav />
    </div>
  );
}