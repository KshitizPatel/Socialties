import ContactPageClient from "./_components/ContactPageClient";

export const revalidate = 60;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchCompany() {
  try {
    const res = await fetch(`${API_BASE}/api/public/company`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const company = await fetchCompany();
  return <ContactPageClient company={company} />;
}
