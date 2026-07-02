import Link from "next/link";
import { Instagram, Linkedin, Mail, MapPin, Phone, Youtube, Facebook, Twitter } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface FooterData {
  description: string | null;
  copyrightText: string | null;
  showSocialIcons: boolean;
  quickLinks: { label: string; href: string }[];
}

interface CompanyData {
  address: string | null;
  phone: string | null;
  email: string | null;
  legalName: string | null;
  instagram: string | null;
  linkedin: string | null;
  youtube: string | null;
  facebook: string | null;
  twitter: string | null;
}

async function fetchFooter(): Promise<FooterData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/footer`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchCompany(): Promise<CompanyData | null> {
  try {
    const res = await fetch(`${API_BASE}/api/public/company`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Footer() {
  const [footer, company] = await Promise.all([fetchFooter(), fetchCompany()]);

  const currentYear = new Date().getFullYear();

  const description =
    footer?.description ??
    "We pair data-driven strategy with authentic storytelling to take your brand from just online to absolutely unforgettable.";

  const copyrightText = (
    footer?.copyrightText ?? `© {{year}} Socialties. All Rights Reserved. Legal Entity: Pushpa Exim.`
  ).replace("{{year}}", String(currentYear));

  const quickLinks = footer?.quickLinks ?? [
    { label: "Home", href: "/" },
    { label: "Campaigns", href: "/campaigns" },
    { label: "Team", href: "/team" },
    { label: "Contact Us", href: "/contact" },
  ];

  const showSocials = footer?.showSocialIcons ?? true;
  const address = company?.address ?? "Azadpur, New Delhi, India";
  const phone = company?.phone ?? "+91 98765 43210";
  const email = company?.email ?? "connect@socialties.in";
  const legalName = company?.legalName ?? "Pushpa Exim Private Limited";

  return (
    <footer className="bg-brand-ink text-brand-cream border-t border-border/20 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Column 1: Brand & Socials */}
        <div className="space-y-6">
          <Link href="/" className="font-extrabold text-2xl tracking-tight">
            Social<span className="text-brand-lime">ties</span>
          </Link>
          <p className="text-sm text-fg-muted max-w-xs">{description}</p>

          {showSocials && (
            <div className="flex space-x-3 flex-wrap gap-y-2">
              {(company?.instagram ?? "https://instagram.com/socialties") && (
                <a href={company?.instagram ?? "https://instagram.com/socialties"} target="_blank" rel="noreferrer"
                  className="p-2 bg-brand-ink-soft hover:bg-brand-lime hover:text-black rounded-lg transition-colors border border-border/10" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
              )}
              {(company?.linkedin ?? "https://linkedin.com/company/socialties") && (
                <a href={company?.linkedin ?? "https://linkedin.com/company/socialties"} target="_blank" rel="noreferrer"
                  className="p-2 bg-brand-ink-soft hover:bg-brand-lime hover:text-black rounded-lg transition-colors border border-border/10" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
              )}
              {company?.youtube && (
                <a href={company.youtube} target="_blank" rel="noreferrer"
                  className="p-2 bg-brand-ink-soft hover:bg-brand-lime hover:text-black rounded-lg transition-colors border border-border/10" aria-label="YouTube">
                  <Youtube size={18} />
                </a>
              )}
              {company?.facebook && (
                <a href={company.facebook} target="_blank" rel="noreferrer"
                  className="p-2 bg-brand-ink-soft hover:bg-brand-lime hover:text-black rounded-lg transition-colors border border-border/10" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              )}
              {company?.twitter && (
                <a href={company.twitter} target="_blank" rel="noreferrer"
                  className="p-2 bg-brand-ink-soft hover:bg-brand-lime hover:text-black rounded-lg transition-colors border border-border/10" aria-label="Twitter / X">
                  <Twitter size={18} />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Column 2: Quick Links (dynamic from DB) */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-brand-lime mb-6">Quick Links</h4>
          <ul className="space-y-4 text-sm text-fg-muted">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="hover:text-brand-lime transition-colors">{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Services (static — driven by services section) */}
        <div>
          <h4 className="font-semibold text-sm uppercase tracking-wider text-brand-lime mb-6">Our Services</h4>
          <ul className="space-y-4 text-sm text-fg-muted">
            {["Influencer Marketing", "Digital Advertising", "Content Creation", "Product Photography", "Website Development", "App Development"].map((s) => (
              <li key={s}>
                <Link href="/#services" className="hover:text-brand-lime transition-colors">{s}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Contact (dynamic from DB) */}
        <div className="space-y-4 text-sm text-fg-muted">
          <h4 className="font-semibold text-sm uppercase tracking-wider text-brand-lime mb-2">Contact</h4>
          {address && (
            <div className="flex items-start space-x-3">
              <MapPin size={18} className="text-brand-lime shrink-0 mt-0.5" />
              <p>{address}</p>
            </div>
          )}
          {phone && (
            <div className="flex items-center space-x-3">
              <Phone size={18} className="text-brand-lime shrink-0" />
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="hover:text-brand-lime transition-colors">{phone}</a>
            </div>
          )}
          {email && (
            <div className="flex items-center space-x-3">
              <Mail size={18} className="text-brand-lime shrink-0" />
              <a href={`mailto:${email}`} className="hover:text-brand-lime transition-colors">{email}</a>
            </div>
          )}
          {legalName && <p className="text-xs text-fg-muted/60 pt-2">{legalName}</p>}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 border-t border-border/10 mt-16 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-fg-muted gap-4">
        <p>{copyrightText}</p>
        <div className="flex space-x-6">
          <Link href="/privacy-policy" className="hover:text-brand-lime transition-colors">Privacy Policy</Link>
          <Link href="/terms-of-service" className="hover:text-brand-lime transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
