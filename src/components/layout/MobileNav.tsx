"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="bg-cyber-card/90 backdrop-blur-xl border-4 border-cyber-neon rounded-full px-8 py-4 flex gap-8">
        <Link href="/dashboard" className={pathname === "/dashboard" ? "text-cyber-neon" : "text-cyan-300"}>
          Home
        </Link>
        <Link href="/dashboard/churn" className={pathname.includes("churn") ? "text-red-400" : "text-cyan-300"}>
          Churn
        </Link>
        <Link href="/pricing" className="text-purple-400">
          Upgrade
        </Link>
      </div>
    </div>
  );
}