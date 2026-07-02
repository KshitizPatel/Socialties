"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Trash2, Save, Check, AlertCircle } from "lucide-react";
import { adminPost } from "@/lib/admin-fetch";

interface QuickLink { label: string; href: string; }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function FooterSettingsPage() {
  const [quickLinks, setQuickLinks] = useState<QuickLink[]>([]);
  const [copyrightText, setCopyrightText] = useState("");
  const [description, setDescription] = useState("");
  const [showSocialIcons, setShowSocialIcons] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/footer`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setQuickLinks(data.quickLinks ?? []);
          setCopyrightText(data.copyrightText ?? "");
          setDescription(data.description ?? "");
          setShowSocialIcons(data.showSocialIcons ?? true);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await adminPost("/api/settings/footer", { quickLinks, copyrightText, description, showSocialIcons });
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

  if (loading) return <div className="animate-pulse text-sm text-fg-muted">Loading footer settings...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><Megaphone size={22} className="text-teal-400" /> Footer Settings</h1>
          <p className="text-sm text-fg-muted mt-1">Manage footer links, copyright text and description.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-lime text-black font-bold text-sm rounded-xl disabled:opacity-60 transition-all">
          {saved ? <Check size={16} /> : <Save size={16} />}
          {saved ? "Saved!" : saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">
          <AlertCircle size={16} />{error}
        </div>
      )}

      <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
        <h2 className="font-bold text-sm">Content</h2>
        <div>
          <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime resize-none" />
        </div>
        <div>
          <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Copyright Text</label>
          <input value={copyrightText} onChange={(e) => setCopyrightText(e.target.value)}
            className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
            placeholder="© {{year}} Socialties. All Rights Reserved." />
          <p className="text-xs text-fg-muted mt-1">Use {"{{year}}"} for dynamic year.</p>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={showSocialIcons} onChange={(e) => setShowSocialIcons(e.target.checked)} className="accent-brand-lime w-4 h-4" />
          <span className="text-sm font-semibold">Show Social Icons</span>
        </label>
      </div>

      <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">Quick Links</h2>
          <button onClick={() => setQuickLinks((prev) => [...prev, { label: "New Link", href: "/" }])}
            className="flex items-center gap-1.5 text-xs font-bold text-brand-lime border border-brand-lime/30 px-3 py-1.5 rounded-lg hover:bg-brand-lime/5 transition-all">
            <Plus size={14} /> Add Link
          </button>
        </div>
        <div className="space-y-3">
          {quickLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-3">
              <input value={link.label} onChange={(e) => setQuickLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, label: e.target.value } : l))}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
                placeholder="Label" />
              <input value={link.href} onChange={(e) => setQuickLinks((prev) => prev.map((l, idx) => idx === i ? { ...l, href: e.target.value } : l))}
                className="flex-1 px-3 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
                placeholder="/path" />
              <button onClick={() => setQuickLinks((prev) => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {quickLinks.length === 0 && <p className="text-sm text-fg-muted text-center py-4">No quick links added.</p>}
        </div>
      </div>
    </div>
  );
}
