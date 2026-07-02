import { auth } from "@/auth";
import CtaSectionsClient from "@/components/admin/CtaSectionsClient";

export const revalidate = 0;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminCtaSectionsPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let sections: any[] = [];
  try {
    const res = await fetch(`${API_BASE}/api/cta-sections`, { cache: "no-store", headers });
    if (res.ok) sections = await res.json();
  } catch {}

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">CTA Sections</h1>
        <p className="text-sm text-fg-muted">Edit the call-to-action banners and contact band shown on the homepage.</p>
      </div>
      <CtaSectionsClient initialSections={sections} />
    </div>
  );
}
