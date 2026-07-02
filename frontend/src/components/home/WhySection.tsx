"use client";

import * as LucideIcons from "lucide-react";
import { CheckCircle2, ShieldCheck, Zap, Users, BarChart3, HelpCircle, Layers } from "lucide-react";
import { motion } from "framer-motion";

interface WhyCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  sortOrder: number;
  isVisible: boolean;
}

interface HomepageSettings {
  whyHeadline?: string | null;
  whySubtext?: string | null;
  whyBadges?: Array<{ label: string; color: string }> | null;
}

const FALLBACK_CARDS: WhyCard[] = [
  { id: "1", title: "Vast Creator Network", description: "Access a curated roster of pre-vetted creators across multiple niches with active, engaged followings.", icon: "Users", sortOrder: 0, isVisible: true },
  { id: "2", title: "Swift Campaign Execution", description: "Go from campaign concept to active live postings in record time with our streamlined execution pipeline.", icon: "Zap", sortOrder: 1, isVisible: true },
  { id: "3", title: "Verified Audiences", description: "We filter out fake followers and bot engagement to ensure every dollar is spent on genuine real people.", icon: "ShieldCheck", sortOrder: 2, isVisible: true },
  { id: "4", title: "Transparent Partnership", description: "No hidden management fees, clear pricing models, and honest feedback loop on campaign expectations.", icon: "CheckCircle2", sortOrder: 3, isVisible: true },
  { id: "5", title: "End-to-End Management", description: "From discovery, briefing, negotiation, content supervision to posting, we handle every detail.", icon: "Layers", sortOrder: 4, isVisible: true },
  { id: "6", title: "Performance Analytics", description: "Track conversions, click-through rates, reach, and total engagement with our granular post-campaign reports.", icon: "BarChart3", sortOrder: 5, isVisible: true },
  { id: "7", title: "Dedicated Account Support", description: "A single dedicated campaign manager coordinating every step of your campaigns to ensure flawless execution.", icon: "HelpCircle", sortOrder: 6, isVisible: true },
];

const DEFAULT_BADGES = [
  { label: "ROI Focused", color: "lime" },
  { label: "Creator-First", color: "violet" },
  { label: "Full Transparency", color: "white" },
];

interface Props {
  whyCards?: WhyCard[] | null;
  settings?: HomepageSettings | null;
}

export default function WhySection({ whyCards, settings }: Props) {
  const cards = (whyCards && whyCards.length > 0) ? whyCards : FALLBACK_CARDS;
  const badges = (settings?.whyBadges as any[] | null) ?? DEFAULT_BADGES;
  const whyHeadline = settings?.whyHeadline || "Data-backed strategy paired with creative storytelling.";
  const whySubtext = settings?.whySubtext || "We don't believe in vanity metrics like impressions without context. We design influencer marketing and advertising campaigns focused on conversions, app installs, sales, and genuine brand affinity.";

  const getBadgeClass = (color: string) => {
    if (color === "lime") return "px-3 py-1.5 bg-brand-lime/10 border border-brand-lime/20 text-brand-lime rounded-lg text-xs font-semibold uppercase tracking-wider";
    if (color === "violet") return "px-3 py-1.5 bg-brand-violet/10 border border-brand-violet/20 text-brand-violet rounded-lg text-xs font-semibold uppercase tracking-wider";
    return "px-3 py-1.5 bg-white/5 border border-white/10 text-white/80 rounded-lg text-xs font-semibold uppercase tracking-wider";
  };

  return (
    <section className="bg-brand-ink py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-lime/5 rounded-full blur-[160px] -z-10" />

      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <h2 className="text-sm font-semibold tracking-wider text-brand-lime uppercase">
            Why Socialties
          </h2>
          <p className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
            We deliver results that move the needle.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Intro card */}
          <div className="lg:col-span-2 flex flex-col justify-center space-y-6 bg-brand-ink-soft/60 border border-white/5 rounded-3xl p-8 backdrop-blur-sm">
            <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
              {whyHeadline}
            </h3>
            <p className="text-sm text-fg-muted dark:text-fg-muted/80 leading-relaxed">
              {whySubtext}
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              {badges.map((badge: any, i: number) => (
                <span key={i} className={getBadgeClass(badge.color)}>
                  {badge.label}
                </span>
              ))}
            </div>
          </div>

          {cards.map((card, idx) => {
            const Icon = (LucideIcons as any)[card.icon] || HelpCircle;
            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.05 }}
                key={card.id}
                className="bg-brand-ink-soft/40 border border-white/5 rounded-3xl p-8 space-y-6 hover:border-brand-lime/20 transition-colors duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-lime/10 flex items-center justify-center text-brand-lime">
                  <Icon size={20} />
                </div>
                <div className="space-y-2">
                  <h4 className="text-lg font-bold text-white">{card.title}</h4>
                  <p className="text-xs text-fg-muted dark:text-fg-muted/70 leading-relaxed">{card.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
