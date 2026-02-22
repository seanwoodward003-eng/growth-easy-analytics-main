// app/api/logout/route.ts
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  const cookieStore = cookies();

  // Delete cookies aggressively
  cookieStore.delete('access_token', { path: '/' });
  cookieStore.delete('refresh_token', { path: '/' });
  cookieStore.delete('csrf_token', { path: '/' });

  // Return HTML with client-side clear + breakout redirect
  const logoutHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Logging out...</title>
    </head>
    <body>
      <p>Logging out... Redirecting.</p>
      <script>
        // Clear any client-side state
        localStorage.clear();
        sessionStorage.clear();

        // Break out of Shopify Admin iframe
        const target = "/";  // Change to "/login" if you have a separate login page
        if (window.top && window.top !== window.self) {
          window.top.location.href = target + "?logged_out=true";
        } else {
          window.location.href = target + "?logged_out=true";
        }
      </script>
    </body>
    </html>
  `;

  return new NextResponse(logoutHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  });
}