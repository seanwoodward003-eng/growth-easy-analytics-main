import { NextResponse } from 'next/server';

const BACKEND_URL = 'https://growth-easy-analytics-2.onrender.com';

export async function GET(request: Request) {
  const response = await fetch(`${BACKEND_URL}/api/metrics`, {
    method: 'GET',
    headers: request.headers, // Forwards cookies automatically
  });

  const data = await response.json();
  return NextResponse.json(data, {
    status: response.status,
    headers: {
      'Access-Control-Allow-Origin': '*', // Optional, safe here
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}