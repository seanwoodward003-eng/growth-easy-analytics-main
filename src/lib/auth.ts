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
    };
    expires: string;
} | null;

export async function getServerSession(): Promise<Session> {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) return null;

    try {
        const payload = jwt.verify(token, JWT_SECRET) as {
            sub: string;
            email: string;
            exp: number;
        };

        return {
            user: {
                id: Number(payload.sub),
                email: payload.email,
            },
            expires: new Date(payload.exp * 1000).toISOString(),
        };
    } catch {
        return null;
    }
}