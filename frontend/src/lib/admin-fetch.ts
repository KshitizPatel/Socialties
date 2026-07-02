/**
 * admin-fetch.ts
 * 
 * Auth-aware fetch helper for admin pages.
 * Automatically attaches the JWT Bearer token from the NextAuth session.
 * Use this on ALL admin mutation requests to the backend.
 */

import { getSession } from "next-auth/react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

/** Retrieve the JWT token from the NextAuth session */
async function getAdminToken(): Promise<string | null> {
  try {
    const session = await getSession();
    return (session?.user as any)?.accessToken ?? null;
  } catch {
    return null;
  }
}

interface AdminFetchOptions extends RequestInit {
  body?: any;
}

/**
 * Authenticated fetch that attaches the Bearer token automatically.
 * Use for all admin POST/PUT/DELETE requests.
 */
export async function adminFetch(
  path: string,
  options: AdminFetchOptions = {}
): Promise<Response> {
  const token = await getAdminToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
}

/** Helper: POST JSON with auth */
export async function adminPost(path: string, body: unknown) {
  return adminFetch(path, { method: "POST", body });
}

/** Helper: PUT JSON with auth */
export async function adminPut(path: string, body: unknown) {
  return adminFetch(path, { method: "PUT", body });
}

/** Helper: PATCH JSON with auth */
export async function adminPatch(path: string, body: unknown) {
  return adminFetch(path, { method: "PATCH", body });
}

/** Helper: DELETE with auth */
export async function adminDelete(path: string) {
  return adminFetch(path, { method: "DELETE" });
}
