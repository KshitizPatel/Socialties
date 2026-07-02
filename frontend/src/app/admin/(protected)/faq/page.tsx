import { auth } from "@/auth";
import FaqCrudClient from "@/components/admin/FaqCrudClient";

export const revalidate = 0;
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminFaqPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let faqs: any[] = [];
  try {
    const res = await fetch(`${API_BASE}/api/faq/all`, { cache: "no-store", headers });
    if (res.ok) faqs = await res.json();
  } catch {}

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">FAQ</h1>
        <p className="text-sm text-fg-muted">Manage frequently asked questions shown on the homepage.</p>
      </div>
      <FaqCrudClient initialFaqs={faqs} />
    </div>
  );
}
