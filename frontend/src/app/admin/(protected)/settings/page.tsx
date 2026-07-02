import SettingsClient from "@/components/admin/SettingsClient";

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminSettingsPage() {
  let formattedSettings = null;
  try {
    const res = await fetch(`${API_BASE}/api/settings`, { cache: "no-store" });
    if (res.ok) {
      const settings = await res.json();
      if (settings) {
        formattedSettings = {
          heroHeadline: settings.heroHeadline,
          heroSubheading: settings.heroSubheading,
          heroEyebrow: settings.heroEyebrow ?? null,
          heroPrimaryBtnText: settings.heroPrimaryBtnText ?? null,
          heroPrimaryBtnHref: settings.heroPrimaryBtnHref ?? null,
          heroSecondaryBtnText: settings.heroSecondaryBtnText ?? null,
          heroSecondaryBtnHref: settings.heroSecondaryBtnHref ?? null,
          statCampaigns: settings.statCampaigns,
          statBrands: settings.statBrands,
          statCreators: settings.statCreators,
          statReach: Number(settings.statReach),
          whyHeadline: settings.whyHeadline ?? null,
          whySubtext: settings.whySubtext ?? null,
          whyBadges: settings.whyBadges ?? null,
        };
      }
    }
  } catch {
    // render with null on failure — client handles defaults
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">Homepage Settings</h1>
        <p className="text-sm text-fg-muted">
          Edit hero text, buttons, Why Section intro, and animated stat counters.
        </p>
      </div>
      <SettingsClient initialSettings={formattedSettings} />
    </div>
  );
}
