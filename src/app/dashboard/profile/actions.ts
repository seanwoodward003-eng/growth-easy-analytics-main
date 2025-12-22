// lib/auth-client.ts  ← New file (or replace your old session file with this)

import jwtDecode from "jwt-decode"; // Install if needed: npm install jwt-decode
// Or use: import { jwtDecode } from "jwt-decode";

export type Session = {
  user: {
    id: number;
    email: string;
    shopifyConnected?: boolean;
    ga4Connected?: boolean;
    hubspotConnected?: boolean;
  };
  expires: string;
} | null;

/**
 * Client-side only session checker
 * Works in static export — reads token from localStorage OR readable cookie
 */
export function getClientSession(): Session {
  // Option 1: Token stored in localStorage (recommended for JWT)
  let token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  // Option 2: If you prefer cookies (Flask must set httpOnly=false)
  if (!token && typeof document !== "undefined") {
    token =
      document.cookie
        .split("; ")
        .find((row) => row.startsWith("access_token="))
        ?.split("=")[1] ?? null;
  }

  if (!token) {
    return null;
  }

  try {
    const payload: any = jwtDecode(token);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      // Expired → clean up
      localStorage.removeItem("access_token");
      // Optional: clear cookie too
      document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      return null;
    }

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
    // Invalid token
    localStorage.removeItem("access_token");
    return null;
  }
}