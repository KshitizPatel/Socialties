"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Play, ArrowRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface HeroProps {
  headline: string;
  subheading: string;
  eyebrow?: string | null;
  primaryBtnText?: string | null;
  primaryBtnHref?: string | null;
  secondaryBtnText?: string | null;
  secondaryBtnHref?: string | null;
  stats: {
    campaigns: number;
    brands: number;
    creators: number;
    reach: bigint;
  };
}

export default function Hero({ headline, subheading, stats, eyebrow, primaryBtnText, primaryBtnHref, secondaryBtnText, secondaryBtnHref }: HeroProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const formatReach = (num: bigint) => {
    if (num >= BigInt("10000000")) {
      return (Number(num) / 10000000).toFixed(0) + "Cr+";
    }
    if (num >= BigInt("1000000")) {
      return (Number(num) / 1000000).toFixed(0) + "M+";
    }
    return num.toString();
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-20 px-6">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-brand-ink -z-20" />
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#1c1435_0%,transparent_50%),radial-gradient(circle_at_70%_60%,#2a2050_0%,transparent_50%)] -z-10 transition-transform duration-300 ease-out"
        style={{
          transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
        }}
      />
      
      {/* Animated blob overlays */}
      <div className="absolute top-[20%] left-[10%] w-[300px] h-[300px] bg-brand-lime/10 rounded-full blur-[100px] animate-pulse" />
      <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-brand-violet/10 rounded-full blur-[120px] animate-pulse [animation-duration:8s]" />

      <div className="max-w-5xl mx-auto text-center space-y-10 relative">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center space-x-2 bg-brand-ink-soft/80 border border-border/10 px-4 py-2 rounded-full text-xs font-semibold tracking-wider text-brand-lime uppercase backdrop-blur-sm"
        >
          <Sparkles size={12} className="animate-spin [animation-duration:4s]" />
          <span>{eyebrow || "India's Influencer Marketing Partner"}</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-display font-black tracking-tight text-white leading-[1.05]"
        >
          {headline}
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-fg-muted dark:text-fg-muted/80 leading-relaxed"
        >
          {subheading}
        </motion.p>

        {/* CTA Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href={primaryBtnHref || "/brands"}
            className="w-full sm:w-auto px-8 py-4 font-bold uppercase tracking-wider rounded-xl bg-brand-lime hover:bg-brand-lime-dark text-black transition-all flex items-center justify-center space-x-2 shadow-lg shadow-brand-lime/10 group"
          >
            <span>{primaryBtnText || "Launch a Campaign"}</span>
            <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href={secondaryBtnHref || "/creators"}
            className="w-full sm:w-auto px-8 py-4 font-bold uppercase tracking-wider rounded-xl border border-white/20 hover:border-white/40 text-white transition-all bg-white/5 backdrop-blur-sm flex items-center justify-center space-x-2 hover:bg-white/10"
          >
            {secondaryBtnText || "Join as Creator"}
          </Link>
        </motion.div>

        {/* Interactive Stats Panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 max-w-4xl mx-auto"
        >
          {[
            { label: "Campaigns Finished", value: stats.campaigns + "+" },
            { label: "Partner Brands", value: stats.brands + "+" },
            { label: "Influencers Managed", value: stats.creators + "+" },
            { label: "Combined Reach", value: formatReach(stats.reach) },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-brand-ink-soft/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center hover:border-brand-lime/20 transition-all duration-300"
            >
              <span className="text-3xl sm:text-4xl font-display font-black text-brand-lime">
                {stat.value}
              </span>
              <span className="text-xs text-fg-muted dark:text-fg-muted/60 mt-1 uppercase tracking-wider text-center font-medium">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
