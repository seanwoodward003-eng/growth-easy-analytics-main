// src/app/api/auth/[provider]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }  // <-- Make it Promise<{ ... }>
) {
  const { provider } = await params;  // <-- Await here

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_FRONTEND_URL}/?error=login_required`);
  }

  const url = new URL(request.url);
  const shop = provider === 'shopify' ? url.searchParams.get('shop') : null;

  if (provider === 'shopify') {
    if (!shop || !shop.endsWith('.myshopify.com')) {
      return new Response('Invalid Shopify store', { status: 400 });
    }
    const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${process.env.SHOPIFY_API_KEY}&scope=read_orders,read_customers,read_products&redirect_uri=${process.env.DOMAIN}/api/auth/shopify/callback&state=${user.id}|${shop}`;
    return NextResponse.redirect(authUrl);
  }

  if (provider === 'ga4') {
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.DOMAIN}/api/auth/ga4/callback&response_type=code&scope=https://www.googleapis.com/auth/analytics.readonly https://www.googleapis.com/auth/analytics.manage.users&access_type=offline&prompt=consent&state=${user.id}`;
    return NextResponse.redirect(authUrl);
  }

  if (provider === 'hubspot') {
    const authUrl = `https://app.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID}&redirect_uri=${process.env.DOMAIN}/api/auth/hubspot/callback&scope=crm.objects.contacts.read crm.objects.deals.read&response_type=code&state=${user.id}`;
    return NextResponse.redirect(authUrl);
  }

  return new Response('Invalid provider', { status: 400 });
}