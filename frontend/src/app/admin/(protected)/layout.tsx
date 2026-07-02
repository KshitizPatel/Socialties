import { auth, signOut } from "@/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Users2,
  Inbox,
  UserCheck,
  Settings,
  LogOut,
  User,
  Globe,
  Building2,
  FileText,
  Megaphone,
  Monitor,
  Star,
  Layers,
  Image,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const handleLogout = async () => {
    "use server";
    await signOut({ redirectTo: "/admin/login" });
  };

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Campaigns", href: "/admin/campaigns", icon: FolderKanban },
    { label: "Team Members", href: "/admin/team", icon: Users2 },
    { label: "Brand Leads", href: "/admin/brand-leads", icon: Inbox },
    { label: "Creator Applications", href: "/admin/creator-applications", icon: UserCheck },
    { label: "Testimonials", href: "/admin/testimonials", icon: Star },
    { label: "Services", href: "/admin/services", icon: Layers },
    { label: "Media Library", href: "/admin/media", icon: Image },
  ];

  const contentItems = [
    { label: "FAQ", href: "/admin/faq", icon: FileText },
    { label: "Why Section", href: "/admin/why-section", icon: Globe },
    { label: "CTA Sections", href: "/admin/cta-sections", icon: Megaphone },
  ];

  const settingsItems = [
    { label: "Homepage", href: "/admin/settings", icon: Settings },
    { label: "Navbar", href: "/admin/settings/navbar", icon: Globe },
    { label: "Footer", href: "/admin/settings/footer", icon: Megaphone },
    { label: "Company", href: "/admin/settings/company", icon: Building2 },
    { label: "SEO", href: "/admin/settings/seo", icon: FileText },
    { label: "System", href: "/admin/settings/system", icon: Monitor },
  ];


  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-border bg-bg-elevated hidden md:flex flex-col justify-between p-6 h-screen sticky top-0">
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="font-extrabold text-xl tracking-tight block">
            Social<span className="text-brand-lime">ties</span> Admin
          </Link>

          {/* Main Nav */}
          <nav className="flex flex-col space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-background hover:text-brand-lime text-sm font-semibold transition-all text-fg-muted">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Settings Group */}
          <div>
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-fg-muted/50 mb-2">Content Pages</p>
            <nav className="flex flex-col space-y-1">
              {contentItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-background hover:text-brand-lime text-sm font-semibold transition-all text-fg-muted">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Settings Group */}
          <div>
            <p className="px-4 text-[10px] font-bold uppercase tracking-widest text-fg-muted/50 mb-2">CMS Settings</p>
            <nav className="flex flex-col space-y-1">
              {settingsItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href}
                    className="flex items-center space-x-3 px-4 py-2.5 rounded-xl hover:bg-background hover:text-brand-lime text-sm font-semibold transition-all text-fg-muted">
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Footer actions / User profiles */}
        <div className="space-y-4 pt-6 border-t border-border/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-lime/15 border border-brand-lime/20 flex items-center justify-center text-brand-lime">
              <User size={18} />
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[150px]">{session.user?.name}</p>
              <p className="text-[10px] text-fg-muted uppercase tracking-wider font-semibold">
                {(session.user as any)?.role || "ADMIN"}
              </p>
            </div>
          </div>

          <form action={handleLogout}>
            <button
              type="submit"
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-sm font-semibold transition-all text-fg-muted"
            >
              <LogOut size={18} />
              <span>Log Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header for mobile view */}
        <header className="md:hidden border-b border-border bg-bg-elevated p-4 flex justify-between items-center">
          <Link href="/" className="font-extrabold text-lg tracking-tight">
            Social<span className="text-brand-lime">ties</span>
          </Link>
          <form action={handleLogout}>
            <button
              type="submit"
              className="p-2 border border-border rounded-xl text-fg-muted hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
            </button>
          </form>
        </header>

        {/* Dynamic page children */}
        <main className="flex-1 p-6 sm:p-10 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
