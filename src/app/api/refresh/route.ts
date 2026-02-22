import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { generateTokens, generateCsrfToken, setAuthCookies } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  // Ensure CORS headers for Shopify Admin iframe
  const origin = request.headers.get('origin') || '';
  const response = NextResponse.next();

  const allowedOrigins = [
    'https://admin.shopify.com',
    'https://*.myshopify.com',
    'https://*.shopify.com'
  ];

  if (allowedOrigins.some(o => origin.startsWith(o) || origin.endsWith(o.replace('*', '')))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers: response.headers });
  }

  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('csrf_token');

    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status, headers: response.headers }
    );
  }

  const user = authResult.user;

  const { access, refresh: newRefresh } = await generateTokens(user.id, user.email);

  const csrf = generateCsrfToken();

  const finalResponse = NextResponse.json({ success: true }, { headers: response.headers });

  // Pass finalResponse as 4th argument
  await setAuthCookies(access, newRefresh, csrf, finalResponse);

  return finalResponse;
}

export async function OPTIONS() {
  const response = NextResponse.next();

  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'https://admin.shopify.com',
    'https://*.myshopify.com',
    'https://*.shopify.com'
  ];

  if (allowedOrigins.some(o => origin.startsWith(o) || origin.endsWith(o.replace('*', '')))) {
    response.headers.set('Access-Control-Allow-Origin', origin);
  } else {
    response.headers.set('Access-Control-Allow-Origin', '*');
  }

  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  return new NextResponse(null, { status: 204, headers: response.headers });
}