"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";
import { unstable_noStore as noStore } from "next/cache"; // ← Add this import

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

export async function getServerSession(): Promise<Session> {
  noStore(); // ← Prevents any static analysis issues

  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/");
  }

  // Move JWT_SECRET read INSIDE the function
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    // In production, this will only happen at runtime if misconfigured
    console.error("JWT_SECRET is missing in environment");
    redirect("/");
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);

    if (typeof verified === "string" || !verified || typeof verified !== "object") {
      redirect("/");
    }

    const payload = verified as {
      sub: string;
      email: string;
      exp: number;
      shopifyConnected?: boolean;
      ga4Connected?: boolean;
      hubspotConnected?: boolean;
    };

    if (!payload.sub || !payload.email || typeof payload.exp !== "number") {
      redirect("/");
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
    redirect("/");
  }
}