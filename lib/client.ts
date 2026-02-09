// lib/auth-client.ts
export async function refreshToken() {
  try {
    const res = await fetch('/api/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) {
      // Token refresh failed → force logout
      window.location.href = '/';
      return false;
    }
    return true;
  } catch (err) {
    console.error('Token refresh failed', err);
    return false;
  }
}