import CampaignsCrudClient from "@/components/admin/CampaignsCrudClient";
import { auth } from "@/auth";

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminCampaignsPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let campaigns = [];
  try {
    // Fetch all campaigns (any status) for admin management
    const res = await fetch(`${API_BASE}/api/campaigns/all`, {
      cache: "no-store",
      headers,
    });
    if (res.ok) campaigns = await res.json();
    else {
      // fallback to public endpoint if /all doesn't exist yet
      const fallback = await fetch(`${API_BASE}/api/campaigns`, { cache: "no-store" });
      if (fallback.ok) campaigns = await fallback.json();
    }
  } catch {
    // render with empty list on failure
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">Campaigns</h1>
        <p className="text-sm text-fg-muted">Create, edit, and delete case studies showcased on the platform.</p>
      </div>
      <CampaignsCrudClient initialCampaigns={campaigns} />
    </div>
  );
}
