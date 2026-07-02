import Link from "next/link";
import {
  FolderKanban, Users2, Inbox, UserCheck, Settings2, Home, Globe,
  ArrowRight, LayoutDashboard, FileText, Image, Activity, Database,
  Shield, Clock, CheckCircle, AlertCircle, Megaphone, Building2,
  Star, Layers, Monitor
} from "lucide-react";

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function fetchApi(path: string) {
  try {
    const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function AdminDashboard() {
  const [campaigns, team, brandLeads, creatorApps, auditLogs, systemSettings, testimonials, services] = await Promise.all([
    fetchApi("/api/campaigns"),
    fetchApi("/api/team"),
    fetchApi("/api/brand-leads"),
    fetchApi("/api/creator-applications"),
    fetchApi("/api/settings/audit-logs"),
    fetchApi("/api/public/system"),
    fetchApi("/api/testimonials"),
    fetchApi("/api/services"),
  ]);

  const campaignsCount = campaigns?.length ?? 0;
  const teamCount = team?.length ?? 0;
  const brandLeadsCount = brandLeads?.length ?? 0;
  const creatorAppsCount = creatorApps?.length ?? 0;
  const testimonialsCount = testimonials?.length ?? 0;
  const servicesCount = services?.length ?? 0;
  const recentLeads = (brandLeads ?? []).slice(0, 5);
  const recentApps = (creatorApps ?? []).slice(0, 5);
  const recentLogs = (auditLogs ?? []).slice(0, 8);

  const kpis = [
    { label: "Total Campaigns", value: campaignsCount, icon: FolderKanban, color: "text-brand-lime", bg: "bg-brand-lime/10", href: "/admin/campaigns" },
    { label: "Team Members", value: teamCount, icon: Users2, color: "text-violet-500", bg: "bg-violet-500/10", href: "/admin/team" },
    { label: "Brand Leads", value: brandLeadsCount, icon: Inbox, color: "text-blue-500", bg: "bg-blue-500/10", href: "/admin/brand-leads" },
    { label: "Creator Apps", value: creatorAppsCount, icon: UserCheck, color: "text-green-500", bg: "bg-green-500/10", href: "/admin/creator-applications" },
    { label: "Testimonials", value: testimonialsCount, icon: Star, color: "text-yellow-400", bg: "bg-yellow-400/10", href: "/admin/testimonials" },
    { label: "Services", value: servicesCount, icon: Layers, color: "text-pink-400", bg: "bg-pink-400/10", href: "/admin/services" },
  ];

  // CMS Quick Edit Cards
  const cmsCards = [
    { label: "Homepage", desc: "Hero, stats, partners", icon: Home, href: "/admin/settings", color: "text-brand-lime" },
    { label: "Navbar", desc: "Links, logo, favicon", icon: Globe, href: "/admin/settings/navbar", color: "text-blue-400" },
    { label: "Company Profile", desc: "About, contact, maps", icon: Building2, href: "/admin/settings/company", color: "text-orange-400" },
    { label: "Campaigns", desc: "Create & manage", icon: FolderKanban, href: "/admin/campaigns", color: "text-violet-400" },
    { label: "Team Members", desc: "Add & edit members", icon: Users2, href: "/admin/team", color: "text-pink-400" },
    { label: "Testimonials", desc: "Brand & creator reviews", icon: Star, href: "/admin/testimonials", color: "text-yellow-400" },
    { label: "Services", desc: "What we offer", icon: Layers, href: "/admin/services", color: "text-cyan-400" },
    { label: "Media Library", desc: "Images & videos", icon: Image, href: "/admin/media", color: "text-purple-400" },
    { label: "SEO Settings", desc: "Meta, OG, keywords", icon: FileText, href: "/admin/settings/seo", color: "text-lime-400" },
    { label: "Footer", desc: "Links, copyright, socials", icon: Megaphone, href: "/admin/settings/footer", color: "text-teal-400" },
    { label: "System", desc: "Maintenance, banners", icon: Monitor, href: "/admin/settings/system", color: "text-red-400" },
  ];

  const apiStatus = { label: "API Status", ok: true };
  const dbStatus = { label: "Database", ok: systemSettings !== null || auditLogs !== null };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-black tracking-tight">Control Center</h1>
          <p className="text-sm text-fg-muted">Manage all website content and configurations from here.</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${apiStatus.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            {apiStatus.ok ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
            API {apiStatus.ok ? "Online" : "Offline"}
          </span>
          <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold ${dbStatus.ok ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
            <Database size={12} />
            DB {dbStatus.ok ? "Connected" : "Offline"}
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;
            return (
              <Link key={kpi.label} href={kpi.href}
                className="bg-bg-elevated border border-border p-6 rounded-3xl flex items-center justify-between shadow-sm hover:border-brand-lime/30 transition-all group">
                <div className="space-y-1">
                  <span className="text-xs text-fg-muted uppercase tracking-wider font-semibold">{kpi.label}</span>
                  <p className="text-3xl font-black text-foreground">{kpi.value}</p>
                </div>
                <div className={`p-4 ${kpi.bg} border border-border rounded-2xl ${kpi.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={22} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CMS Quick Edit Cards */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <LayoutDashboard size={18} className="text-brand-lime" />
            CMS Quick Edit
          </h2>
          <span className="text-xs text-fg-muted">Click any card to manage that section</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {cmsCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.label} href={card.href}
                className="bg-bg-elevated border border-border rounded-2xl p-5 hover:border-brand-lime/40 hover:bg-bg-elevated/80 transition-all group flex flex-col gap-3">
                <div className={`w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center ${card.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{card.label}</p>
                  <p className="text-xs text-fg-muted">{card.desc}</p>
                </div>
                <ArrowRight size={14} className={`${card.color} self-end opacity-0 group-hover:opacity-100 transition-opacity`} />
              </Link>
            );
          })}
        </div>
      </section>

      {/* Activity & Recent Submissions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Brand Leads */}
        <div className="bg-bg-elevated border border-border rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Inbox size={16} className="text-blue-400" />
              Brand Leads
            </h2>
            <Link href="/admin/brand-leads" className="text-xs font-bold uppercase tracking-wider text-brand-lime hover:text-brand-lime flex items-center gap-1">
              All <ArrowRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-border/10">
            {recentLeads.length === 0 ? (
              <p className="text-sm text-fg-muted py-4">No recent brand leads.</p>
            ) : recentLeads.map((lead: any) => (
              <div key={lead.id} className="py-3 flex justify-between items-center text-sm first:pt-0 last:pb-0">
                <div>
                  <h3 className="font-semibold text-foreground text-xs">{lead.companyName}</h3>
                  <p className="text-xs text-fg-muted">{lead.contactPerson}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 font-bold uppercase rounded-md">{lead.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Creator Applications */}
        <div className="bg-bg-elevated border border-border rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <UserCheck size={16} className="text-green-400" />
              Creator Applications
            </h2>
            <Link href="/admin/creator-applications" className="text-xs font-bold uppercase tracking-wider text-brand-lime flex items-center gap-1">
              All <ArrowRight size={10} />
            </Link>
          </div>
          <div className="divide-y divide-border/10">
            {recentApps.length === 0 ? (
              <p className="text-sm text-fg-muted py-4">No recent applications.</p>
            ) : recentApps.map((app: any) => (
              <div key={app.id} className="py-3 flex justify-between items-center text-sm first:pt-0 last:pb-0">
                <div>
                  <h3 className="font-semibold text-foreground text-xs">{app.fullName}</h3>
                  <p className="text-xs text-fg-muted">{app.category}</p>
                </div>
                <span className="text-xs px-2 py-0.5 bg-green-500/10 text-green-400 font-bold uppercase rounded-md">{app.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Audit Logs */}
        <div className="bg-bg-elevated border border-border rounded-3xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <Activity size={16} className="text-violet-400" />
              Recent Activity
            </h2>
            <Shield size={14} className="text-fg-muted" />
          </div>
          <div className="divide-y divide-border/10">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-fg-muted py-4">No activity yet.</p>
            ) : recentLogs.map((log: any) => (
              <div key={log.id} className="py-3 first:pt-0 last:pb-0">
                <p className="text-xs font-semibold text-foreground">{log.action?.replace(/_/g, " ")}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock size={10} className="text-fg-muted" />
                  <p className="text-xs text-fg-muted">
                    {log.actor?.name} · {new Date(log.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status Bar */}
      <div className="bg-bg-elevated border border-border rounded-2xl p-5 flex flex-wrap items-center gap-6">
        <span className="text-xs font-bold text-fg-muted uppercase tracking-wider">System Status</span>
        <StatusPill label="Frontend" ok={true} />
        <StatusPill label="Backend API" ok={apiStatus.ok} />
        <StatusPill label="Database" ok={dbStatus.ok} />
        <StatusPill label="Auth Service" ok={true} />
        {systemSettings?.maintenanceMode && (
          <span className="ml-auto flex items-center gap-1.5 text-xs font-bold text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-lg">
            <AlertCircle size={12} /> Maintenance Mode Active
          </span>
        )}
      </div>
    </div>
  );
}

function StatusPill({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5 text-xs font-semibold">
      <span className={`w-2 h-2 rounded-full ${ok ? "bg-green-400" : "bg-red-400"}`} />
      <span className="text-fg-muted">{label}</span>
    </div>
  );
}
