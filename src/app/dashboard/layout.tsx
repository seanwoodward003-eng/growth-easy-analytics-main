export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2c] via-[#0f1a3d] to-[#1a1f3d] flex flex-col items-center justify-start">
      <main className="w-full max-w-5xl px-6 py-12">
        {children}
      </main>
    </div>
  );
}