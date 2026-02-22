import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { generateTokens, generateCsrfToken, setAuthCookies } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  console.log('[REFRESH] Refresh request received');

  // CORS for Shopify Admin iframe (no next())
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'https://admin.shopify.com',
    'https://*.myshopify.com',
    'https://*.shopify.com'
  ];

  let corsHeaders = {};
  if (allowedOrigins.some(o => origin.startsWith(o) || origin.endsWith(o.replace('*', '')))) {
    corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  } else {
    corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }

  const authResult = await authenticateRequest(request);

  if (!authResult.success) {
    const response = NextResponse.json(
      { error: authResult.error },
      { status: authResult.status, headers: corsHeaders }
    );

    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('csrf_token');

    return response;
  }

  const user = authResult.user;

  const { access, refresh: newRefresh } = await generateTokens(user.id, user.email);

  const csrf = generateCsrfToken();

  const response = NextResponse.json({ success: true }, { headers: corsHeaders });

  await setAuthCookies(access, newRefresh, csrf, response);

  return response;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') || '';
  const allowedOrigins = [
    'https://admin.shopify.com',
    'https://*.myshopify.com',
    'https://*.shopify.com'
  ];

  let corsHeaders = {};
  if (allowedOrigins.some(o => origin.startsWith(o) || origin.endsWith(o.replace('*', '')))) {
    corsHeaders = {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  } else {
    corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };
  }

  return new NextResponse(null, { status: 204, headers: corsHeaders });
}