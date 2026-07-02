"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/components/providers/theme-provider";
import { Sun, Moon, Menu, X, Phone, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavItem {
  label: string;
  href: string;
  isExternal: boolean;
  show: boolean;
}

const defaultNavLinks: NavItem[] = [
  { label: "Home", href: "/", isExternal: false, show: true },
  { label: "Campaigns", href: "/campaigns", isExternal: false, show: true },
  { label: "Team", href: "/team", isExternal: false, show: true },
  { label: "Contact Us", href: "/contact", isExternal: false, show: true },
];

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function Navbar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [navLinks, setNavLinks] = useState<NavItem[]>(defaultNavLinks);

  // Fetch dynamic nav links (no-throw — always falls back to defaults)
  useEffect(() => {
    fetch(`${API_BASE}/api/public/navbar`, { signal: AbortSignal.timeout(3000) })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.navItems && Array.isArray(data.navItems) && data.navItems.length > 0) {
          setNavLinks(data.navItems.filter((n: NavItem) => n.show !== false));
        }
      })
      .catch(() => {}); // Silently fall back to defaults
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isOpen) setIsOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/80 backdrop-blur-md border-b border-border py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo Wordmark */}
        <Link href="/" className="flex items-center space-x-1 group">
          <span className="font-extrabold text-2xl tracking-tight text-foreground transition-colors">
            Social
            <span className="text-brand-lime group-hover:text-brand-lime-dark transition-colors relative">
              ties
              <span className="absolute -top-1 left-[14px] w-1.5 h-1.5 bg-brand-lime rounded-full" />
            </span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                target={link.isExternal ? "_blank" : undefined}
                rel={link.isExternal ? "noreferrer" : undefined}
                className="relative font-medium text-sm tracking-wide text-foreground/80 hover:text-foreground transition-colors py-1 group"
              >
                {link.label}
                <span
                  className={`absolute bottom-0 left-0 right-0 h-[2px] bg-brand-lime origin-center transform transition-transform duration-300 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Right Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full border border-border hover:bg-bg-elevated transition-colors text-foreground"
            aria-label="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <Link
            href="/brands"
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg border border-foreground hover:bg-foreground hover:text-background transition-all duration-300"
          >
            For Brands
          </Link>
          <Link
            href="/creators"
            className="px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg bg-brand-lime hover:bg-brand-lime-dark text-black transition-all duration-300 shadow-md shadow-brand-lime/10"
          >
            For Creators
          </Link>
        </div>

        {/* Mobile Menu Actions */}
        <div className="flex md:hidden items-center space-x-3">
          <button onClick={toggleTheme} className="p-2 rounded-full border border-border text-foreground" aria-label="Toggle Theme">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setIsOpen(!isOpen)} className="p-2 rounded-full border border-border text-foreground" aria-label="Menu">
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-[72px] z-40 bg-background/95 backdrop-blur-lg flex flex-col justify-between p-8 border-t border-border"
          >
            <div className="flex flex-col space-y-6">
              {navLinks.map((link, idx) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={link.href}
                >
                  <Link
                    href={link.href}
                    target={link.isExternal ? "_blank" : undefined}
                    className="text-2xl font-bold text-foreground hover:text-brand-lime transition-colors"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col space-y-4 pt-6 border-t border-border">
              <Link href="/brands" className="w-full py-3 text-center font-semibold uppercase tracking-wider rounded-lg border border-foreground text-foreground hover:bg-foreground hover:text-background transition-all">
                For Brands
              </Link>
              <Link href="/creators" className="w-full py-3 text-center font-semibold uppercase tracking-wider rounded-lg bg-brand-lime text-black hover:bg-brand-lime-dark transition-all">
                For Creators
              </Link>
              <div className="flex justify-between items-center gap-4 pt-4">
                <a href="tel:+919876543210" className="flex-1 py-3 flex items-center justify-center space-x-2 border border-border rounded-lg text-sm text-foreground/80 hover:text-foreground transition-all">
                  <Phone size={16} /><span>Call Us</span>
                </a>
                <a href="https://wa.me/919876543210" target="_blank" rel="noreferrer"
                  className="flex-1 py-3 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm transition-all">
                  <MessageCircle size={16} /><span>WhatsApp</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
