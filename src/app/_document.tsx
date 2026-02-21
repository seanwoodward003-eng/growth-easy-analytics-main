// app/_document.tsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Shopify Embedded App Bridge – must be very early, synchronous */}
        <meta
          name="shopify-api-key"
          content={process.env.NEXT_PUBLIC_SHOPIFY_API_KEY || ''}
        />

        {/* Critical: NO async, NO defer – Shopify requires synchronous load */}
        <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js" />

        {/* Optional: Polaris (can be async) */}
        <script
          src="https://cdn.shopify.com/shopifycloud/polaris.js"
          async
          crossOrigin="anonymous"
        />

        {/* Viewport – good to have early */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover"
        />
      </Head>

      <body className="bg-[#0a0f2c] text-cyan-200 min-h-dvh relative overflow-x-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}