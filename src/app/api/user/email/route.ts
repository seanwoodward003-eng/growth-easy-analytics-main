import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth'; // Adjust path if your auth file is named differently

export async function GET() {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ email: user.email });
}