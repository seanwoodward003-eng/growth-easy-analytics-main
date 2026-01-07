import { NextResponse } from 'next/server';
// Import your auth lib, e.g., import { getUserFromSession } from '@/lib/auth';
// Import DB, e.g., import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  // TODO: Authenticate user
  // const user = await getUserFromSession();
  // if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { type } = await request.json();
  if (!['shopify', 'ga4', 'hubspot'].includes(type)) {
    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  }

  try {
    // TODO: Clear tokens in DB
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { [`${type}Token`]: null }, // Or whatever your fields are
    // });

    // Optionally revoke access with external API (e.g., Shopify revoke)
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to disconnect' }, { status: 500 });
  }
}