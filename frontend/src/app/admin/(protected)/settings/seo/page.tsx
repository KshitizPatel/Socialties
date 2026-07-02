"use client";

import { useState, useEffect } from "react";
import { FileText, Save, Check, AlertCircle } from "lucide-react";
import { adminPost } from "@/lib/admin-fetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SeoEntry {
  pagePath: string;
  title: string;
  description: string;
  ogImageUrl?: string;
  keywords?: string[];
}

const defaultPages = ["/", "/campaigns", "/team", "/contact", "/brands", "/creators"];

export default function SeoSettingsPage() {
  const [entries, setEntries] = useState<SeoEntry[]>([]);
  const [selected, setSelected] = useState("/");
  const [form, setForm] = useState<SeoEntry>({ pagePath: "/", title: "", description: "", ogImageUrl: "", keywords: [] });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/settings/seo`)
      .then((r) => r.json())
      .then((data: SeoEntry[]) => {
        setEntries(data ?? []);
        const found = (data ?? []).find((e) => e.pagePath === "/");
        if (found) setForm({ ...found, keywords: found.keywords ?? [] });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const selectPage = (path: string) => {
    setSelected(path);
    const found = entries.find((e) => e.pagePath === path);
    setForm(found ? { ...found, keywords: found.keywords ?? [] } : { pagePath: path, title: "", description: "", ogImageUrl: "", keywords: [] });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await adminPost("/api/settings/seo", form);
      if (res.ok) {
        const updated = await res.json();
        setEntries((prev) => {
          const idx = prev.findIndex((e) => e.pagePath === updated.pagePath);
          if (idx >= 0) { const next = [...prev]; next[idx] = updated; return next; }
          return [...prev, updated];
        });
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

  if (loading) return <div className="animate-pulse text-sm text-fg-muted">Loading SEO settings...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><FileText size={22} className="text-yellow-400" /> SEO Settings</h1>
          <p className="text-sm text-fg-muted mt-1">Set meta titles, descriptions, and OpenGraph per page.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-black font-bold text-sm rounded-xl disabled:opacity-60 transition-all">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Page SEO"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Page Selector */}
      <div className="bg-bg-elevated border border-border rounded-2xl p-4 flex flex-wrap gap-2">
        {defaultPages.map((p) => (
          <button key={p} onClick={() => selectPage(p)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${selected === p ? "bg-brand-lime text-black" : "bg-background border border-border text-fg-muted hover:text-foreground"}`}>
            {p === "/" ? "Home" : p.slice(1)}
          </button>
        ))}
      </div>

      {/* Form */}
      <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
        <p className="text-xs text-fg-muted font-mono">{form.pagePath}</p>
        <div>
          <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Page Title</label>
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
            placeholder="Page Title | Socialties" />
        </div>
        <div>
          <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Meta Description</label>
          <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3} className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime resize-none"
            placeholder="150-160 character description..." />
        </div>
        <div>
          <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">OG Image URL</label>
          <input value={form.ogImageUrl ?? ""} onChange={(e) => setForm((f) => ({ ...f, ogImageUrl: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
            placeholder="https://..." />
        </div>
        <div>
          <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Keywords (comma separated)</label>
          <input value={(form.keywords ?? []).join(", ")}
            onChange={(e) => setForm((f) => ({ ...f, keywords: e.target.value.split(",").map((k) => k.trim()).filter(Boolean) }))}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
            placeholder="influencer marketing, brand partnerships..." />
        </div>
      </div>
    </div>
  );
}
