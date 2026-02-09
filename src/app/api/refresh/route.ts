// app/api/refresh/route.ts   (or wherever this file lives)
import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, generateCsrfToken, setAuthCookies, verifyRefreshToken } from '@/lib/auth';
import { getRow } from '@/lib/db';  // import directly — cleaner than dynamic import

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No refresh token provided' },
      { status: 401 }
    );
  }

  // Verify the refresh token
  const payload = await verifyRefreshToken(refreshToken);

  if (!payload || !payload.sub) {
    // Token invalid/expired → clear cookies and reject
    const response = NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
    response.cookies.delete('access_token', { path: '/' });
    response.cookies.delete('refresh_token', { path: '/' });
    response.cookies.delete('csrf_token', { path: '/' });
    return response;
  }

  // Get user data (only what's needed — email here)
  const user = await getRow<{ email: string }>(
    'SELECT email FROM users WHERE id = ?',
    [payload.sub]
  );

  if (!user) {
    // Rare case — user deleted but token still exists
    const response = NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
    response.cookies.delete('access_token', { path: '/' });
    response.cookies.delete('refresh_token', { path: '/' });
    response.cookies.delete('csrf_token', { path: '/' });
    return response;
  }

  // Generate new tokens
  const { access, refresh: newRefresh } = await generateTokens(payload.sub, user.email);

  // Generate fresh CSRF token
  const csrf = generateCsrfToken();

  // Prepare response
  const response = NextResponse.json({ success: true });

  // Set new cookies (httpOnly, secure, etc.)
  await setAuthCookies(access, newRefresh, csrf);

  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}