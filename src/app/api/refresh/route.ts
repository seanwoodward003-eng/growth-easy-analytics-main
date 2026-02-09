// app/api/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateTokens, generateCsrfToken, setAuthCookies, verifyRefreshToken } from '@/lib/auth';
import { getRow } from '@/lib/db';

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json(
      { error: 'No refresh token provided' },
      { status: 401 }
    );
  }

  const payload = await verifyRefreshToken(refreshToken);

  if (!payload || !payload.sub) {
    const response = NextResponse.json(
      { error: 'Invalid or expired refresh token' },
      { status: 401 }
    );
    // Fixed delete calls
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('csrf_token');
    return response;
  }

  const user = await getRow<{ email: string }>(
    'SELECT email FROM users WHERE id = ?',
    [payload.sub]
  );

  if (!user) {
    const response = NextResponse.json(
      { error: 'User not found' },
      { status: 404 }
    );
    // Fixed delete calls
    response.cookies.delete('access_token');
    response.cookies.delete('refresh_token');
    response.cookies.delete('csrf_token');
    return response;
  }

  const { access, refresh: newRefresh } = await generateTokens(payload.sub, user.email);

  const csrf = generateCsrfToken();

  const response = NextResponse.json({ success: true });

  await setAuthCookies(access, newRefresh, csrf);

  return response;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}