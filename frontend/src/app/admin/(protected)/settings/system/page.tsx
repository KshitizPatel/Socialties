"use client";

import { useState, useEffect } from "react";
import { Monitor, Save, Check, AlertTriangle, AlertCircle } from "lucide-react";
import { adminPost } from "@/lib/admin-fetch";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function SystemSettingsPage() {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#CCFF00");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/public/system`)
      .then((r) => r.json())
      .then((data) => {
        if (data) {
          setMaintenanceMode(data.maintenanceMode ?? false);
          setShowBanner(data.showBanner ?? false);
          setBannerText(data.bannerText ?? "");
          setPrimaryColor(data.primaryColor ?? "#CCFF00");
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await adminPost("/api/settings/system", { maintenanceMode, showBanner, bannerText, primaryColor });
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

  if (loading) return <div className="animate-pulse text-sm text-fg-muted">Loading system settings...</div>;

  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black flex items-center gap-2"><Monitor size={22} className="text-red-400" /> System Settings</h1>
          <p className="text-sm text-fg-muted mt-1">Control maintenance mode, banners, and theme color.</p>
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

      {maintenanceMode && (
        <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-orange-400">
          <AlertTriangle size={18} />
          <p className="text-sm font-semibold">Maintenance mode is active. Website may be inaccessible to visitors.</p>
        </div>
      )}

      <div className="bg-bg-elevated border border-border rounded-2xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Maintenance Mode</p>
            <p className="text-xs text-fg-muted">Show a maintenance page to all visitors</p>
          </div>
          <button onClick={() => setMaintenanceMode((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${maintenanceMode ? "bg-red-500" : "bg-border"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${maintenanceMode ? "left-7" : "left-1"}`} />
          </button>
        </div>

        <div className="h-px bg-border" />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Site Banner</p>
            <p className="text-xs text-fg-muted">Show an announcement banner at the top of the site</p>
          </div>
          <button onClick={() => setShowBanner((v) => !v)}
            className={`relative w-12 h-6 rounded-full transition-colors ${showBanner ? "bg-brand-lime" : "bg-border"}`}>
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${showBanner ? "left-7" : "left-1"}`} />
          </button>
        </div>

        {showBanner && (
          <div>
            <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Banner Text</label>
            <input value={bannerText} onChange={(e) => setBannerText(e.target.value)}
              className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime"
              placeholder="Welcome to our new platform..." />
          </div>
        )}

        <div className="h-px bg-border" />

        <div>
          <label className="text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5">Primary Brand Color</label>
          <div className="flex items-center gap-3">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="w-12 h-10 rounded-lg border border-border cursor-pointer bg-background p-1" />
            <input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)}
              className="flex-1 px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-brand-lime font-mono" />
          </div>
        </div>
      </div>
    </div>
  );
}
