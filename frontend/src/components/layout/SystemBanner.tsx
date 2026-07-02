import { X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchSystemSettings() {
  try {
    const res = await fetch(`${API_BASE}/api/public/system`, { next: { revalidate: 30 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * SystemBanner — server component.
 * Renders a dismissible top banner when showBanner=true and bannerText is set in SystemSettings.
 * Renders nothing if conditions aren't met.
 */
export default async function SystemBanner() {
  const settings = await fetchSystemSettings();
  if (!settings?.showBanner || !settings?.bannerText) return null;

  return (
    <div
      id="system-banner"
      className="relative z-[60] w-full bg-brand-lime text-black text-center text-sm font-semibold py-2.5 px-12 flex items-center justify-center"
    >
      <span>{settings.bannerText}</span>
      {/* 
        Dismiss via inline script to avoid a client component wrapper.
        The banner hides itself via display:none stored in sessionStorage.
      */}
      <button
        id="system-banner-close"
        aria-label="Dismiss banner"
        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-black/10 rounded-full transition-colors"
        onClick={undefined}
      >
        <X size={16} />
      </button>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function(){
              var key = 'banner-dismissed-${settings.bannerText?.slice(0, 20).replace(/\W/g, "")}';
              if (sessionStorage.getItem(key)) {
                document.getElementById('system-banner').style.display = 'none';
              }
              document.getElementById('system-banner-close').addEventListener('click', function(){
                document.getElementById('system-banner').style.display = 'none';
                sessionStorage.setItem(key, '1');
              });
            })();
          `,
        }}
      />
    </div>
  );
}
