"use client";

import { useState } from "react";
import { updateHomepageSettings } from "@/app/admin/(protected)/settings/_actions/settings";
import { CheckCircle, Plus, Trash2, Save, Loader2 } from "lucide-react";

interface Badge { label: string; color: string; }

interface SettingsClientProps {
  initialSettings: {
    heroHeadline: string;
    heroSubheading: string;
    heroEyebrow?: string | null;
    heroPrimaryBtnText?: string | null;
    heroPrimaryBtnHref?: string | null;
    heroSecondaryBtnText?: string | null;
    heroSecondaryBtnHref?: string | null;
    statCampaigns: number;
    statBrands: number;
    statCreators: number;
    statReach: number;
    whyHeadline?: string | null;
    whySubtext?: string | null;
    whyBadges?: Badge[] | null;
  } | null;
}

const input = "w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-lime text-sm text-foreground";
const lbl = "text-xs font-semibold uppercase tracking-wider text-fg-muted block mb-1.5";

type Tab = "hero" | "why" | "stats";

export default function SettingsClient({ initialSettings }: SettingsClientProps) {
  const s = initialSettings;
  const [tab, setTab] = useState<Tab>("hero");

  // Hero fields
  const [heroHeadline, setHeroHeadline] = useState(s?.heroHeadline || "");
  const [heroSubheading, setHeroSubheading] = useState(s?.heroSubheading || "");
  const [heroEyebrow, setHeroEyebrow] = useState(s?.heroEyebrow || "");
  const [heroPrimaryBtnText, setHeroPrimaryBtnText] = useState(s?.heroPrimaryBtnText || "");
  const [heroPrimaryBtnHref, setHeroPrimaryBtnHref] = useState(s?.heroPrimaryBtnHref || "");
  const [heroSecondaryBtnText, setHeroSecondaryBtnText] = useState(s?.heroSecondaryBtnText || "");
  const [heroSecondaryBtnHref, setHeroSecondaryBtnHref] = useState(s?.heroSecondaryBtnHref || "");

  // Stats
  const [statCampaigns, setStatCampaigns] = useState(s?.statCampaigns || 0);
  const [statBrands, setStatBrands] = useState(s?.statBrands || 0);
  const [statCreators, setStatCreators] = useState(s?.statCreators || 0);
  const [statReach, setStatReach] = useState(s?.statReach || 0);

  // Why Section
  const [whyHeadline, setWhyHeadline] = useState(s?.whyHeadline || "");
  const [whySubtext, setWhySubtext] = useState(s?.whySubtext || "");
  const [whyBadges, setWhyBadges] = useState<Badge[]>(
    (s?.whyBadges as Badge[] | null) ?? [
      { label: "ROI Focused", color: "lime" },
      { label: "Creator-First", color: "violet" },
      { label: "Full Transparency", color: "white" },
    ]
  );

  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addBadge = () => setWhyBadges((b) => [...b, { label: "", color: "lime" }]);
  const removeBadge = (i: number) => setWhyBadges((b) => b.filter((_, idx) => idx !== i));
  const updateBadge = (i: number, field: keyof Badge, val: string) =>
    setWhyBadges((b) => b.map((badge, idx) => (idx === i ? { ...badge, [field]: val } : badge)));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(false);
    setError(null);
    try {
      const res = await updateHomepageSettings({
        heroHeadline, heroSubheading,
        heroEyebrow: heroEyebrow || undefined,
        heroPrimaryBtnText: heroPrimaryBtnText || undefined,
        heroPrimaryBtnHref: heroPrimaryBtnHref || undefined,
        heroSecondaryBtnText: heroSecondaryBtnText || undefined,
        heroSecondaryBtnHref: heroSecondaryBtnHref || undefined,
        statCampaigns, statBrands, statCreators, statReach,
        whyHeadline: whyHeadline || undefined,
        whySubtext: whySubtext || undefined,
        whyBadges: whyBadges.filter((b) => b.label.trim()),
      });
      if (res.success) setSuccess(true);
      else setError(res.error || "Failed to save");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const TABS: { key: Tab; label: string }[] = [
    { key: "hero", label: "Hero Section" },
    { key: "why", label: "Why Section Intro" },
    { key: "stats", label: "Stat Counters" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {success && (
        <div className="bg-brand-lime/10 border border-brand-lime/30 text-brand-lime p-4 rounded-xl flex items-center gap-2 font-semibold text-sm">
          <CheckCircle size={18} /> Settings saved! Changes are live on the public site.
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Tab Bar */}
      <div className="flex gap-1 bg-bg-elevated border border-border rounded-2xl p-1.5">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setTab(t.key)}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === t.key ? "bg-brand-lime text-black shadow-sm" : "text-fg-muted hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── HERO TAB ── */}
      {tab === "hero" && (
        <div className="bg-bg-elevated border border-border rounded-3xl p-8 space-y-6">
          <div className="space-y-1.5">
            <label className={lbl}>Eyebrow Badge Text</label>
            <input value={heroEyebrow} onChange={(e) => setHeroEyebrow(e.target.value)}
              placeholder="India's Influencer Marketing Partner"
              className={input} />
            <p className="text-[11px] text-fg-muted">Small badge above the headline. Leave empty for default.</p>
          </div>

          <div className="space-y-1.5">
            <label className={lbl}>Hero Headline *</label>
            <input required value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)}
              className={`${input} font-bold text-base`} />
          </div>

          <div className="space-y-1.5">
            <label className={lbl}>Hero Subheading *</label>
            <textarea required rows={3} value={heroSubheading} onChange={(e) => setHeroSubheading(e.target.value)}
              className={`${input} resize-none`} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-border/20">
            <div className="space-y-1.5">
              <label className={lbl}>Primary Button Text</label>
              <input value={heroPrimaryBtnText} onChange={(e) => setHeroPrimaryBtnText(e.target.value)}
                placeholder="Launch a Campaign" className={input} />
            </div>
            <div className="space-y-1.5">
              <label className={lbl}>Primary Button URL</label>
              <input value={heroPrimaryBtnHref} onChange={(e) => setHeroPrimaryBtnHref(e.target.value)}
                placeholder="/brands" className={input} />
            </div>
            <div className="space-y-1.5">
              <label className={lbl}>Secondary Button Text</label>
              <input value={heroSecondaryBtnText} onChange={(e) => setHeroSecondaryBtnText(e.target.value)}
                placeholder="Join as Creator" className={input} />
            </div>
            <div className="space-y-1.5">
              <label className={lbl}>Secondary Button URL</label>
              <input value={heroSecondaryBtnHref} onChange={(e) => setHeroSecondaryBtnHref(e.target.value)}
                placeholder="/creators" className={input} />
            </div>
          </div>
        </div>
      )}

      {/* ── WHY SECTION TAB ── */}
      {tab === "why" && (
        <div className="bg-bg-elevated border border-border rounded-3xl p-8 space-y-6">
          <p className="text-xs text-fg-muted">Edit the intro card inside the "Why Socialties" section. Manage individual feature cards from <strong>Content Pages → Why Section</strong>.</p>

          <div className="space-y-1.5">
            <label className={lbl}>Intro Headline</label>
            <input value={whyHeadline} onChange={(e) => setWhyHeadline(e.target.value)}
              placeholder="Data-backed strategy paired with creative storytelling."
              className={`${input} font-bold`} />
          </div>

          <div className="space-y-1.5">
            <label className={lbl}>Intro Subtext</label>
            <textarea rows={3} value={whySubtext} onChange={(e) => setWhySubtext(e.target.value)}
              placeholder="We don't believe in vanity metrics..."
              className={`${input} resize-none`} />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={lbl}>Intro Badges</label>
              <button type="button" onClick={addBadge}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-brand-lime/10 text-brand-lime rounded-lg hover:bg-brand-lime/20 transition-colors">
                <Plus size={12} /> Add Badge
              </button>
            </div>
            <div className="space-y-2">
              {whyBadges.map((badge, i) => (
                <div key={i} className="flex items-center gap-3">
                  <input value={badge.label} onChange={(e) => updateBadge(i, "label", e.target.value)}
                    placeholder="Badge text" className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
                  <select value={badge.color} onChange={(e) => updateBadge(i, "color", e.target.value)}
                    className="px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime">
                    <option value="lime">Lime</option>
                    <option value="violet">Violet</option>
                    <option value="white">White</option>
                  </select>
                  <button type="button" onClick={() => removeBadge(i)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── STATS TAB ── */}
      {tab === "stats" && (
        <div className="bg-bg-elevated border border-border rounded-3xl p-8">
          <p className="text-xs text-fg-muted mb-6">These numbers animate in the hero section stat counters.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: "Campaigns Run", value: statCampaigns, setter: setStatCampaigns },
              { label: "Brands Served", value: statBrands, setter: setStatBrands },
              { label: "Creators Managed", value: statCreators, setter: setStatCreators },
              { label: "Combined Reach", value: statReach, setter: setStatReach },
            ].map(({ label, value, setter }) => (
              <div key={label} className="space-y-1.5">
                <label className={lbl}>{label}</label>
                <input type="number" value={value} onChange={(e) => setter(Number(e.target.value))}
                  className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-lime font-bold text-xl text-foreground" />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button type="submit" disabled={submitting}
          className="flex items-center gap-2 px-8 py-3 bg-brand-lime hover:bg-brand-lime/90 text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-lime/10 disabled:opacity-50">
          {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {submitting ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </form>
  );
}
