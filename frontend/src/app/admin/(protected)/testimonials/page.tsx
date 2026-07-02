import TestimonialsClient from "@/components/admin/TestimonialsClient";
import { auth } from "@/auth";

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminTestimonialsPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  let testimonials = [];
  try {
    const res = await fetch(`${API_BASE}/api/testimonials/all`, {
      cache: "no-store",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (res.ok) testimonials = await res.json();
  } catch {
    // fail gracefully
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">Testimonials</h1>
        <p className="text-sm text-fg-muted">Manage brand and creator testimonials shown on the website.</p>
      </div>
      <TestimonialsClient initialTestimonials={testimonials} />
    </div>
  );
}
