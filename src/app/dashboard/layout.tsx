import { Sidebar } from "@/components/layout/Sidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav"; // assuming you have this

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-[#1a1f3d]">
      <div className="flex flex-col md:flex-row">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-12 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}