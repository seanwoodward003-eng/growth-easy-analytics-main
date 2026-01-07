// app/api/auth/shopify/callback/route.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';
import crypto from 'crypto';

function verifyHMAC(params: URLSearchParams) {
  const hmac = params.get('hmac');
  if (!hmac) return false;
  const message = Array.from(params.entries())
    .filter(([k]) => !['hmac', 'signature'].includes(k))
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const digest = crypto.createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;

  if (!verifyHMAC(params)) {
    return new Response(
      '<script>alert("Invalid signature"); window.location.href = "/dashboard";</script>',
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) {
    return new Response(
      '<script>alert("Auth failed"); window.location.href = "/dashboard";</script>',
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const [userIdStr, shop] = state.split('|');
  const userId = parseInt(userIdStr);
  const user = await getCurrentUser();

  if (!user || user.id !== userId) {
    return new Response(
      '<script>alert("Unauthorized"); window.location.href = "/dashboard";</script>',
      { status: 401, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const tokenResp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenResp.ok) {
    return new Response(
      '<script>alert("Shopify auth failed"); window.location.href = "/dashboard";</script>',
      { status: 400, headers: { 'Content-Type': 'text/html' } }
    );
  }

  const { access_token } = await tokenResp.json();

  await run(
    'UPDATE users SET shopify_shop = ?, shopify_access_token = ? WHERE id = ?',
    [shop, access_token, userId]
  );

  // Success: Redirect to dashboard with trigger param
  return new Response(
    `<script>
      alert("Shopify Connected Successfully!");
      window.location.href = "/dashboard?shopify_connected=true";
    </script>`,
    {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    }
  );
}