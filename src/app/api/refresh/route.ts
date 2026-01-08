// app/api/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, generateCsrfToken, setAuthCookies, verifyRefreshToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: 'No refresh token' }, { status: 401 });
  }

  const payload = verifyRefreshToken(refreshToken);
  if (!payload) {
    const response = NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 });
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('csrf_token');
    return response;
  }

  // Fetch email for access token (optional but recommended)
  // You could also store email in refresh token if you prefer
  const user = await import('@/lib/db').then(mod => mod.getRow<{ email: string }>(
    'SELECT email FROM users WHERE id = ?',
    [payload.sub]
  ));

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { access, refresh: newRefresh } = generateTokens(payload.sub, user.email);
  const csrf = generateCsrfToken();

  const response = NextResponse.json({ success: true });
  await setAuthCookies(access, newRefresh, csrf);
  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}