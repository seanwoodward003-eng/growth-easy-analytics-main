import "./globals.css";
import { Header } from "@/components/layout/Header";

export const metadata = {
  title: "GrowthEasy AI",
  description: "AI Growth Analytics for Shopify",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-orbitron min-h-screen bg-gradient-to-br from-cyber-bg to-black text-cyber-text antialiased">
        {/* Public header - only shown on non-dashboard pages if you want, or keep always */}
        <Header />

        {/* Main content - dashboard pages have their own padding/top space */}
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}