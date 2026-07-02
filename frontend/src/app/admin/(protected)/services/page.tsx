import ServicesClient from "@/components/admin/ServicesClient";
import { auth } from "@/auth";

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminServicesPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  let services = [];
  try {
    const res = await fetch(`${API_BASE}/api/services/all`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) services = await res.json();
  } catch {
    // fail gracefully
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">Services</h1>
        <p className="text-sm text-fg-muted">Manage the service offerings displayed on the website.</p>
      </div>
      <ServicesClient initialServices={services} />
    </div>
  );
}
