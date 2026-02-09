// app/api/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();

  // Delete the auth cookies - adjust names if different
  cookieStore.delete({
    name: 'access_token',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  cookieStore.delete({
    name: 'refresh_token',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  cookieStore.delete({
    name: 'csrf_token',
    path: '/',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  // Optional: if you have a backend session to invalidate, call it here

  return NextResponse.json({ message: 'Logged out' }, { status: 200 });
}