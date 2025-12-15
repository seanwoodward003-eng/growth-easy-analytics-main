"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Churn", href: "/dashboard/churn" },
  { name: "Acquisition", href: "/dashboard/acquisition" },
  { name: "Retention", href: "/dashboard/retention" },
  { name: "Revenue", href: "/dashboard/revenue" },
  { name: "Performance", href: "/dashboard/performance" },
  { name: "AI Insights", href: "/dashboard/ai-insights" }, // ← NEW: Added here
  { name: "Profile", href: "/dashboard/profile" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:block w-72 bg-cyber-card/80 backdrop-blur-xl border-r-4 border-cyber-neon min-h-screen p-8">
      <h2 className="text-4xl font-bold text-cyber-neon mb-12">GrowthEasy AI</h2>
      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block py-4 px-6 rounded-xl text-xl transition relative group ${
              pathname === link.href
                ? "bg-cyber-neon text-black font-bold shadow-lg shadow-cyan-500/50"
                : "hover:bg-white/10"
            }`}
          >
            <span className="relative z-10">{link.name}</span>

            {/* Optional: Add a "NEW" badge only for AI Insights */}
            {link.name === "AI Insights" && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-gradient-to-r from-pink-500 to-purple-600 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                NEW
              </span>
            )}

            {/* Glow effect on hover/active for extra cyberpunk flair */}
            {pathname === link.href && (
              <div className="absolute inset-0 rounded-xl bg-cyber-neon opacity-20 animate-pulse" />
            )}
          </Link>
        ))}

        <Link
          href="/pricing"
          className="block mt-12 py-4 px-6 rounded-xl text-xl bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-bold text-center hover:scale-105 transition shadow-lg"
        >
          Upgrade to Pro
        </Link>
      </nav>
    </aside>
  );
}