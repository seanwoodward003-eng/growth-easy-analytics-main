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

        {/* Debug 1: Log meta value */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              console.log('Meta shopify-api-key content:', 
                document.querySelector('meta[name="shopify-api-key"]')?.getAttribute('content') || 'MISSING_OR_EMPTY'
              );
            `
          }}
        />

        {/* Debug 2: Log script load success/fail */}
        <script
          src="https://cdn.shopify.com/shopifycloud/app-bridge.js"
          onLoad={() => console.log('✅ App Bridge script LOADED from CDN')}
          onError={() => console.log('❌ App Bridge script FAILED to load')}
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