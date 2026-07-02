"use client";

import { useState, useEffect } from "react";
import { Building2, Save, Check } from "lucide-react";
import { adminPost } from "@/lib/admin-fetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const fields = [
  { key: "companyName", label: "Company Name", type: "text" },
  { key: "legalName", label: "Legal Name", type: "text" },
  { key: "registrationDetails", label: "Registration Details", type: "text" },
  { key: "email", label: "Email", type: "text" },
  { key: "phone", label: "Phone", type: "text" },
  { key: "whatsapp", label: "WhatsApp Number", type: "text" },
  { key: "workingHours", label: "Working Hours", type: "text" },
  { key: "address", label: "Address", type: "text" },
  { key: "googleMapsEmbedUrl", label: "Google Maps Embed URL", type: "text" },
  { key: "instagram", label: "Instagram URL", type: "text" },
  { key: "linkedin", label: "LinkedIn URL", type: "text" },
  { key: "facebook", label: "Facebook URL", type: "text" },
  { key: "twitter", label: "Twitter / X URL", type: "text" },
  { key: "youtube", label: "YouTube URL", type: "text" },
  { key: "about", label: "About", type: "textarea" },
  { key: "mission", label: "Mission", type: "textarea" },
  { key: "vision", label: "Vision", type: "textarea" },
  { key: "history", label: "History", type: "textarea" },
];

export default function CompanySettingsPage() {
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/company`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          const cleaned: Record<string, string> = {};
          for (const f of fields) { cleaned[f.key] = data[f.key] ?? ""; }
          setForm(cleaned);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await adminPost("/api/settings/company", form);
      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.error || `Save failed (${res.status})`);
      }
    } catch (e: any) {
      setError(e.message || "Network error");
    }
    setSaving(false);
  };

  if (loading) return <div className="animate-pulse text-sm text-fg-muted">Loading company profile...</div>;

  const textFields = fields.filter((f) => f.type === "text");
  const textareaFields = fields.filter((f) => f.type === "textarea");

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><Building2 size={22} className="text-orange-400" /> Company Profile</h1>
          <p className="text-sm text-fg-muted mt-1">Manage contact information, address, socials, and brand details.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-black font-bold text-sm rounded-xl disabled:opacity-60 transition-all">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {textFields.map((f) => (
            <div key={f.key}>
              <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">{f.label}</label>
              <input value={form[f.key] ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime" />
            </div>
          ))}
        </div>
        {textareaFields.map((f) => (
          <div key={f.key}>
            <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">{f.label}</label>
            <textarea value={form[f.key] ?? ""} onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
              rows={3} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime resize-none" />
          </div>
        ))}
      </div>
    </div>
  );
}
