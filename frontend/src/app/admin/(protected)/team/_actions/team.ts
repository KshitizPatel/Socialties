"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function getToken() {
  const session = await auth();
  return (session?.user as any)?.accessToken ?? null;
}

async function authFetch(path: string, method: string, body?: unknown) {
  const token = await getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  return res;
}

export async function createTeamMember(data: Record<string, unknown>) {
  try {
    const res = await authFetch("/api/team", "POST", data);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || "Failed to create team member" };
    }
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { success: true, data: await res.json() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeamMember(id: string, data: Record<string, unknown>) {
  try {
    const res = await authFetch(`/api/team/${id}`, "PUT", data);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || "Failed to update team member" };
    }
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { success: true, data: await res.json() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTeamMember(id: string) {
  try {
    const res = await authFetch(`/api/team/${id}`, "DELETE");
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.error || "Failed to delete team member" };
    }
    revalidatePath("/admin/team");
    revalidatePath("/team");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
