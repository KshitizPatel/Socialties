"use client";

import { useState, useEffect } from "react";
import { Globe, Plus, Trash2, GripVertical, Save, Check, AlertCircle } from "lucide-react";
import { adminPost } from "@/lib/admin-fetch";

interface NavItem {
  label: string;
  href: string;
  isExternal: boolean;
  show: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function NavbarSettingsPage() {
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [logoUrl, setLogoUrl] = useState("");
  const [faviconUrl, setFaviconUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/navbar`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setLogoUrl(data.logoUrl ?? "");
          setFaviconUrl(data.faviconUrl ?? "");
          setNavItems(data.navItems ?? []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const addItem = () =>
    setNavItems((prev) => [...prev, { label: "New Link", href: "/", isExternal: false, show: true }]);

  const removeItem = (i: number) =>
    setNavItems((prev) => prev.filter((_, idx) => idx !== i));

  const updateItem = (i: number, field: keyof NavItem, value: any) =>
    setNavItems((prev) => prev.map((item, idx) => (idx === i ? { ...item, [field]: value } : item)));

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await adminPost("/api/settings/navbar", { logoUrl, faviconUrl, navItems });
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

  if (loading) return <div className="animate-pulse text-sm text-fg-muted">Loading navbar settings...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><Globe size={22} className="text-blue-400" /> Navbar Settings</h1>
          <p className="text-sm text-fg-muted mt-1">Manage navigation links, logo, and favicon.</p>
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
        <h2 className="font-bold text-sm">Brand Assets</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Logo URL</label>
            <input value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
              placeholder="/logo.svg" />
          </div>
          <div>
            <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Favicon URL</label>
            <input value={faviconUrl} onChange={(e) => setFaviconUrl(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
              placeholder="/favicon.ico" />
          </div>
        </div>
      </div>

      <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm">Navigation Links</h2>
          <button onClick={addItem} className="flex items-center gap-1.5 text-xs font-bold text-brand-lime border border-brand-lime/30 px-3 py-1.5 rounded-lg hover:bg-brand-lime/5 transition-all">
            <Plus size={14} /> Add Link
          </button>
        </div>
        <div className="space-y-3">
          {navItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 bg-background border border-border rounded-xl">
              <GripVertical size={16} className="text-fg-muted shrink-0 cursor-grab" />
              <input value={item.label} onChange={(e) => updateItem(i, "label", e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-sm focus:outline-none focus:border-brand-lime"
                placeholder="Label" />
              <input value={item.href} onChange={(e) => updateItem(i, "href", e.target.value)}
                className="flex-1 min-w-0 px-3 py-1.5 bg-bg-elevated border border-border rounded-lg text-sm focus:outline-none focus:border-brand-lime"
                placeholder="/path" />
              <label className="flex items-center gap-1.5 text-xs text-fg-muted cursor-pointer shrink-0">
                <input type="checkbox" checked={item.show} onChange={(e) => updateItem(i, "show", e.target.checked)} className="accent-brand-lime" />
                Show
              </label>
              <label className="flex items-center gap-1.5 text-xs text-fg-muted cursor-pointer shrink-0">
                <input type="checkbox" checked={item.isExternal} onChange={(e) => updateItem(i, "isExternal", e.target.checked)} className="accent-brand-lime" />
                Ext
              </label>
              <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-500 shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {navItems.length === 0 && <p className="text-sm text-fg-muted text-center py-6">No nav items. Add one above.</p>}
        </div>
      </div>
    </div>
  );
}
