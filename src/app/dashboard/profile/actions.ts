// src/app/dashboard/profile/actions.ts  (or server-actions.ts)
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import jwt from "jsonwebtoken";

interface Session {
  user: any;
  // add your actual user shape
}

export async function getServerSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login"); // or your login route
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as any;
    return { user: payload };
  } catch (error) {
    redirect("/login");
    return null;
  }
}