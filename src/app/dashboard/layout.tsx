'use client';

import { Menu, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  
          

      {/* Main Content - full width */}
      <main style={{ paddingTop: '6rem', padding: '2rem' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}