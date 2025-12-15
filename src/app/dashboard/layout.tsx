import "@/app/globals.css";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

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
        <Header />
        <main className="pt-20 lg:pt-24 pb-24 lg:pb-8"> {/* Space for fixed header & mobile nav */}
          {children}
        </main>
        <MobileNav />
      </body>
    </html>
  );
}