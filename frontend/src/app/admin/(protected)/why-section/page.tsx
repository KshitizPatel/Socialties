import { auth } from "@/auth";
import WhyCardsCrudClient from "@/components/admin/WhyCardsCrudClient";

export const revalidate = 0;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminWhySectionPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let cards: any[] = [];
  try {
    const res = await fetch(`${API_BASE}/api/why-cards/all`, { cache: "no-store", headers });
    if (res.ok) cards = await res.json();
  } catch {}

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">Why Socialties</h1>
        <p className="text-sm text-fg-muted">Manage the value proposition cards displayed in the "Why Socialties" section.</p>
      </div>
      <WhyCardsCrudClient initialCards={cards} />
    </div>
  );
}
