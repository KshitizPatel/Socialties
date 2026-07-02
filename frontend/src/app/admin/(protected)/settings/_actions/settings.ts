"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

export async function updateHomepageSettings(data: {
  heroHeadline: string;
  heroSubheading: string;
  heroEyebrow?: string;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnHref?: string;
  heroSecondaryBtnText?: string;
  heroSecondaryBtnHref?: string;
  statCampaigns: number;
  statBrands: number;
  statCreators: number;
  statReach: number;
  whyHeadline?: string;
  whySubtext?: string;
  whyBadges?: Array<{ label: string; color: string }>;
}) {
  try {
    const session = await auth();
    const token = (session?.user as any)?.accessToken;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

    const res = await fetch(`${apiBase}/api/settings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to update settings");
    }

    revalidatePath("/");
    revalidatePath("/admin/settings");
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update settings:", error);
    return { success: false, error: error.message };
  }
}
