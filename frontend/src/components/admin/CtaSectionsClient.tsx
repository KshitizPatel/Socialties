"use client";

import { useState } from "react";
import { Save, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

interface CtaSection {
  id?: string;
  key: string;
  headline: string;
  subtext?: string;
  badge?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaText2?: string;
  ctaHref2?: string;
  variant: string;
  isVisible: boolean;
}

interface Props { initialSections: CtaSection[]; }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const session = await (await fetch("/api/auth/session")).json();
  const token = session?.user?.accessToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...opts, headers });
}

const SECTION_META: Record<string, { label: string; description: string }> = {
  brands_banner: { label: "For Brands Banner", description: "Left panel on the homepage CTA split" },
  creators_banner: { label: "For Creators Banner", description: "Right panel on the homepage CTA split" },
  final_band: { label: "Final CTA Band", description: "Bottom gradient CTA band with contact links" },
};

const DEFAULTS: CtaSection[] = [
  { key: "brands_banner", headline: "Launch a campaign that drives real sales.", subtext: "Skip the vanity metrics. Partner with top vetted creators and run optimized social acquisition funnels built for ROI.", badge: "For Brands", ctaText: "Work With Us", ctaHref: "/brands", variant: "dark", isVisible: true },
  { key: "creators_banner", headline: "Turn your influence into consistent income.", subtext: "Get access to premium brand campaigns, transparent payouts, creative support, and long-term representation.", badge: "For Creators", ctaText: "Apply to Join", ctaHref: "/creators", variant: "dark", isVisible: true },
  { key: "final_band", headline: "Ready to grow? Let's talk.", subtext: "Get in touch with our team to kickstart your next campaign today.", ctaText: "Call Us", ctaHref: "tel:+919876543210", ctaText2: "WhatsApp", ctaHref2: "https://wa.me/919876543210", variant: "gradient", isVisible: true },
];

function buildSections(initialSections: CtaSection[]): CtaSection[] {
  return DEFAULTS.map((def) => {
    const found = initialSections.find((s) => s.key === def.key);
    return found || def;
  });
}

export default function CtaSectionsClient({ initialSections }: Props) {
  const [sections, setSections] = useState<CtaSection[]>(buildSections(initialSections));
  const [saving, setSaving] = useState<string | null>(null);

  const update = (key: string, field: string, value: any) => {
    setSections((prev) => prev.map((s) => s.key === key ? { ...s, [field]: value } : s));
  };

  const handleSave = async (section: CtaSection) => {
    setSaving(section.key);
    try {
      const res = await apiFetch(`/api/cta-sections/${section.key}`, {
        method: "PUT",
        body: JSON.stringify(section),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const saved: CtaSection = await res.json();
      setSections((prev) => prev.map((s) => s.key === saved.key ? saved : s));
      toast.success(`${SECTION_META[section.key]?.label || section.key} saved`);
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="space-y-8">
      {sections.map((section) => {
        const meta = SECTION_META[section.key] || { label: section.key, description: "" };
        const isSaving = saving === section.key;

        return (
          <div key={section.key} className={`bg-bg-elevated border rounded-3xl p-6 space-y-5 transition-opacity ${section.isVisible ? "border-border" : "border-border/40 opacity-70"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-black text-lg">{meta.label}</h3>
                <p className="text-xs text-fg-muted mt-0.5">{meta.description}</p>
              </div>
              <button
                onClick={() => update(section.key, "isVisible", !section.isVisible)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${section.isVisible ? "bg-brand-lime/10 text-brand-lime" : "bg-border/30 text-fg-muted"}`}
              >
                {section.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}
                {section.isVisible ? "Visible" : "Hidden"}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Badge Label</label>
                <input value={section.badge || ""} onChange={(e) => update(section.key, "badge", e.target.value)}
                  placeholder="e.g. For Brands"
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Variant</label>
                <select value={section.variant} onChange={(e) => update(section.key, "variant", e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime">
                  <option value="dark">Dark</option>
                  <option value="lime">Lime</option>
                  <option value="gradient">Gradient</option>
                </select>
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Headline *</label>
                <input value={section.headline} onChange={(e) => update(section.key, "headline", e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Subtext</label>
                <textarea rows={2} value={section.subtext || ""} onChange={(e) => update(section.key, "subtext", e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime resize-none" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Primary Button Text</label>
                <input value={section.ctaText || ""} onChange={(e) => update(section.key, "ctaText", e.target.value)}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider">Primary Button URL</label>
                <input value={section.ctaHref || ""} onChange={(e) => update(section.key, "ctaHref", e.target.value)}
                  placeholder="/brands or https://..."
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
              </div>

              {section.key === "final_band" && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider">Secondary Button Text</label>
                    <input value={section.ctaText2 || ""} onChange={(e) => update(section.key, "ctaText2", e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider">Secondary Button URL</label>
                    <input value={section.ctaHref2 || ""} onChange={(e) => update(section.key, "ctaHref2", e.target.value)}
                      className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button onClick={() => handleSave(section)} disabled={!!saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-lime text-black rounded-xl font-bold text-sm hover:bg-brand-lime/90 disabled:opacity-50">
                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {isSaving ? "Saving…" : "Save Section"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
