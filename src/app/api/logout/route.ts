// app/api/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = await cookies();   // ← Add await here!

  // Now cookieStore is the actual ReadonlyRequestCookies object
  cookieStore.delete({
    name: 'access_token',
    path: '/',
    // httpOnly, secure, sameSite are not needed for delete – they are only for set
    // but including them is harmless
  });

  cookieStore.delete({
    name: 'refresh_token',
    path: '/',
  });

  cookieStore.delete({
    name: 'csrf_token',
    path: '/',
  });

  // Optional: more cookies if needed

  return NextResponse.json({ success: true }, { status: 200 });
}