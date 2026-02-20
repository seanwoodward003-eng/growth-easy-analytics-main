// app/layout.tsx — SERVER COMPONENT (NO 'use client' at top)

import "./globals.css";
import { Orbitron } from 'next/font/google';
import { AppBridgeWrapper } from '@/components/AppBridgeWrapper'; // New client wrapper

const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export const metadata = {
  title: 'GrowthEasy AI',
  description: 'Growth coaching powered by AI',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Shopify App Bridge CDN + API key meta */}
        <meta name="shopify-api-key" content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || ''} />
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" async />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover" />
        <title>GrowthEasy AI</title>
      </head>
      <body className={`${orbitron.className} bg-[#0a0f2c] text-cyan-200 min-h-dvh relative overflow-x-hidden`}>
        <AppBridgeWrapper>
          {children}
        </AppBridgeWrapper>
      </body>
    </html>
  );
}