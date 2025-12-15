export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0a0f2c] to-[#1a1f3d] flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-5xl">
        {children}
      </div>
    </div>
  );
}