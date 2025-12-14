// src/lib/auth.ts



import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('Missing JWT_SECRET in environment variables');
}

export type Session = {
  user: {
    id: number;
    email: string;
    // Optional: Add these later when you track connections
    shopifyConnected?: boolean;
    ga4Connected?: boolean;
    hubspotConnected?: boolean;
  };
  expires: string;
} | null;

export async function getServerSession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get('access_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      sub: string;
      email: string;
      exp: number;
      // Optional fields you can add to JWT later
      shopifyConnected?: boolean;
      ga4Connected?: boolean;
      hubspotConnected?: boolean;
    };

    return {
      user: {
        id: Number(payload.sub),
        email: payload.email,
        shopifyConnected: payload.shopifyConnected,
        ga4Connected: payload.ga4Connected,
        hubspotConnected: payload.hubspotConnected,
      },
      expires: new Date(payload.exp * 1000).toISOString(),
    };
  } catch (error) {
    // Invalid or expired token
    return null;
  }
}