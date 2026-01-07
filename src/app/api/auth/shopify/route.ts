// app/api/auth/shopify/route.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return Response.redirect('/login'); // Change to your login route if needed
  }

  const shop = request.nextUrl.searchParams.get('shop');

  if (!shop || !shop.endsWith('.myshopify.com')) {
    return new Response('Invalid or missing Shopify store domain. Must be like: your-store.myshopify.com', {
      status: 400,
    });
  }

  // Build state exactly as your callback expects: userId|shop
  const state = `${user.id}|${shop}`;

  // Make sure this matches exactly what's in your Shopify app settings
  const redirectUri = new URL('/api/auth/shopify/callback', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').toString();

  const authUrl = new URL(`https://${shop}/admin/oauth/authorize`);
  authUrl.searchParams.append('client_id', process.env.SHOPIFY_API_KEY!);
  authUrl.searchParams.append('scope', 'read_orders,read_products,read_customers,read_analytics,read_reports'); // Add your required scopes
  authUrl.searchParams.append('redirect_uri', redirectUri);
  authUrl.searchParams.append('state', state);

  // Optional: for online tokens (per-user access)
  // authUrl.searchParams.append('grant_options[]', 'per-user');

  return Response.redirect(authUrl);
}