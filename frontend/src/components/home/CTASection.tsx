"use client";

import Link from "next/link";
import { ArrowRight, Phone, MessageSquare, Mail } from "lucide-react";
import { motion } from "framer-motion";

interface CtaSection {
  key: string;
  headline: string;
  subtext?: string | null;
  badge?: string | null;
  ctaText?: string | null;
  ctaHref?: string | null;
  ctaText2?: string | null;
  ctaHref2?: string | null;
  variant: string;
  isVisible: boolean;
}

interface Props {
  ctaSections?: Record<string, CtaSection> | null;
  companyPhone?: string | null;
  companyWhatsapp?: string | null;
  companyEmail?: string | null;
}

// Hardcoded defaults — used when DB has no CTA sections yet
const DEFAULTS: Record<string, CtaSection> = {
  brands_banner: { key: "brands_banner", headline: "Launch a campaign that drives real sales.", subtext: "Skip the vanity metrics. Partner with top vetted creators and run optimized social acquisition funnels built for ROI.", badge: "For Brands", ctaText: "Work With Us", ctaHref: "/brands", variant: "dark", isVisible: true },
  creators_banner: { key: "creators_banner", headline: "Turn your influence into consistent income.", subtext: "Get access to premium brand campaigns, transparent payouts, creative support, and long-term representation.", badge: "For Creators", ctaText: "Apply to Join", ctaHref: "/creators", variant: "dark", isVisible: true },
  final_band: { key: "final_band", headline: "Ready to grow? Let's talk.", subtext: "Get in touch with our team to kickstart your next campaign today.", ctaText: "Call Us", ctaHref: "tel:+919876543210", ctaText2: "WhatsApp", ctaHref2: "https://wa.me/919876543210", variant: "gradient", isVisible: true },
};

export default function CTASection({ ctaSections, companyPhone, companyWhatsapp, companyEmail }: Props) {
  const sections = { ...DEFAULTS, ...ctaSections };
  const brands = sections.brands_banner;
  const creators = sections.creators_banner;
  const final = sections.final_band;

  // Dynamic contact links from company profile
  const phoneHref = companyPhone ? `tel:${companyPhone}` : final.ctaHref || "tel:+919876543210";
  const waHref = companyWhatsapp ? `https://wa.me/${companyWhatsapp.replace(/\D/g, "")}` : final.ctaHref2 || "https://wa.me/919876543210";
  const emailHref = companyEmail ? `mailto:${companyEmail}` : "mailto:connect@socialties.in";

  return (
    <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
      {/* Brand/Creator Split Banner */}
      {(brands.isVisible || creators.isVisible) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {brands.isVisible && (
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-brand-ink-soft border border-white/5 rounded-3xl p-8 sm:p-12 flex flex-col justify-between space-y-8 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-violet/10 rounded-full blur-3xl" />
              <div className="space-y-4 relative">
                {brands.badge && (
                  <span className="px-3 py-1 bg-brand-violet/20 border border-brand-violet/30 text-brand-violet text-xs font-semibold rounded-lg uppercase tracking-wide">
                    {brands.badge}
                  </span>
                )}
                <h3 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight">
                  {brands.headline}
                </h3>
                {brands.subtext && (
                  <p className="text-sm text-fg-muted dark:text-fg-muted/70 max-w-md leading-relaxed">{brands.subtext}</p>
                )}
              </div>
              {brands.ctaText && brands.ctaHref && (
                <div className="pt-4 relative">
                  <Link href={brands.ctaHref} className="inline-flex items-center space-x-2 px-6 py-3 font-bold uppercase tracking-wider rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-black transition-all group">
                    <span>{brands.ctaText}</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}

          {creators.isVisible && (
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="bg-brand-ink-soft border border-white/5 rounded-3xl p-8 sm:p-12 flex flex-col justify-between space-y-8 text-white relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-lime/5 rounded-full blur-3xl" />
              <div className="space-y-4 relative">
                {creators.badge && (
                  <span className="px-3 py-1 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-semibold rounded-lg uppercase tracking-wide">
                    {creators.badge}
                  </span>
                )}
                <h3 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-tight">
                  {creators.headline}
                </h3>
                {creators.subtext && (
                  <p className="text-sm text-fg-muted dark:text-fg-muted/70 max-w-md leading-relaxed">{creators.subtext}</p>
                )}
              </div>
              {creators.ctaText && creators.ctaHref && (
                <div className="pt-4 relative">
                  <Link href={creators.ctaHref} className="inline-flex items-center space-x-2 px-6 py-3 font-bold uppercase tracking-wider rounded-xl border border-white/20 hover:border-white/40 text-white transition-all bg-white/5">
                    <span>{creators.ctaText}</span>
                    <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Final CTA Band */}
      {final.isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-brand-violet to-brand-ink border border-border/20 rounded-3xl p-8 sm:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 text-white"
        >
          <div className="space-y-3 text-center lg:text-left">
            <h3 className="text-3xl font-display font-black tracking-tight">{final.headline}</h3>
            {final.subtext && <p className="text-white/80 text-sm max-w-md leading-relaxed">{final.subtext}</p>}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <a href={phoneHref} className="flex items-center space-x-2 px-5 py-3 border border-white/20 hover:border-white/40 rounded-xl text-sm font-semibold transition-all bg-white/5 hover:bg-white/10">
              <Phone size={16} /><span>{final.ctaText || "Call Us"}</span>
            </a>
            <a href={waHref} target="_blank" rel="noreferrer" className="flex items-center space-x-2 px-5 py-3 bg-green-600 hover:bg-green-700 rounded-xl text-sm font-semibold transition-all">
              <MessageSquare size={16} /><span>{final.ctaText2 || "WhatsApp"}</span>
            </a>
            <a href={emailHref} className="flex items-center space-x-2 px-5 py-3 border border-white/20 hover:border-white/40 rounded-xl text-sm font-semibold transition-all bg-white/5 hover:bg-white/10">
              <Mail size={16} /><span>Email</span>
            </a>
          </div>
        </motion.div>
      )}
    </section>
  );
}
