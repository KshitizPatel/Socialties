"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * ScrollConnectionSVG
 * 
 * Premium scroll-linked SVG animation showing brand↔creator connections.
 * Uses requestAnimationFrame + passive scroll listeners for 60fps.
 * Respects prefers-reduced-motion for accessibility.
 * Zero dependencies — pure SVG + CSS transforms.
 */
export default function ScrollConnectionSVG() {
  const svgRef = useRef<SVGSVGElement>(null);
  const progressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const animatePaths = useCallback((progress: number) => {
    const svg = svgRef.current;
    if (!svg) return;

    // Path 1: Main connector arc
    const path1 = svg.querySelector<SVGPathElement>("#conn-path-1");
    if (path1) {
      const length = path1.getTotalLength();
      path1.style.strokeDasharray = `${length}`;
      path1.style.strokeDashoffset = `${length * (1 - progress)}`;
    }

    // Path 2: Secondary arc (delayed)
    const path2 = svg.querySelector<SVGPathElement>("#conn-path-2");
    if (path2) {
      const length = path2.getTotalLength();
      const p2 = Math.max(0, (progress - 0.15) / 0.85);
      path2.style.strokeDasharray = `${length}`;
      path2.style.strokeDashoffset = `${length * (1 - p2)}`;
    }

    // Path 3: Third decorative arc
    const path3 = svg.querySelector<SVGPathElement>("#conn-path-3");
    if (path3) {
      const length = path3.getTotalLength();
      const p3 = Math.max(0, (progress - 0.3) / 0.7);
      path3.style.strokeDasharray = `${length}`;
      path3.style.strokeDashoffset = `${length * (1 - p3)}`;
    }

    // Nodes glow opacity
    const nodes = svg.querySelectorAll<SVGElement>(".conn-node");
    nodes.forEach((node, i) => {
      const nodeProgress = Math.min(1, progress * (nodes.length / (i + 1)));
      node.style.opacity = String(nodeProgress);
      node.style.transform = `scale(${lerp(0.3, 1, nodeProgress)})`;
    });

    // Floating particles follow progress
    const particles = svg.querySelectorAll<SVGElement>(".conn-particle");
    particles.forEach((p, i) => {
      const offset = i * 0.15;
      const pProgress = Math.max(0, Math.min(1, (progress - offset) / (1 - offset)));
      p.style.opacity = String(pProgress > 0.1 && pProgress < 0.9 ? 1 : 0);
      p.style.transform = `translateX(${lerp(-10, 10, pProgress)}px) translateY(${lerp(5, -5, Math.sin(pProgress * Math.PI))}px)`;
    });
  }, []);

  useEffect(() => {
    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = svgRef.current?.closest<HTMLElement>("[data-scroll-section]");
    if (!container) return;

    let currentProgress = 0;
    let targetProgress = 0;

    const onScroll = () => {
      const rect = container.getBoundingClientRect();
      const windowH = window.innerHeight;
      const start = windowH;
      const end = -rect.height;
      const raw = 1 - (rect.top - end) / (start - end);
      targetProgress = Math.max(0, Math.min(1, raw));
    };

    const tick = () => {
      if (!mountedRef.current) return;
      // Smooth lerp toward target
      currentProgress = lerp(currentProgress, targetProgress, 0.06);
      progressRef.current = currentProgress;
      animatePaths(currentProgress);
      rafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      mountedRef.current = false;
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [animatePaths]);

  return (
    <div data-scroll-section className="relative w-full overflow-hidden py-24 select-none pointer-events-none">
      <svg
        ref={svgRef}
        viewBox="0 0 1200 400"
        className="w-full h-auto max-h-[350px]"
        aria-hidden="true"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#a78bfa" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#CCFF00" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="grad3" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.3" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="glow-soft">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Background Grid */}
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-border" opacity="0.3" />
        </pattern>
        <rect width="1200" height="400" fill="url(#grid)" />

        {/* Brand Node (Left) */}
        <g className="conn-node" style={{ transformOrigin: "120px 200px", opacity: 0 }} filter="url(#glow-soft)">
          <circle cx="120" cy="200" r="40" fill="none" stroke="#CCFF00" strokeWidth="1.5" opacity="0.3" />
          <circle cx="120" cy="200" r="28" fill="rgba(204,255,0,0.08)" stroke="#CCFF00" strokeWidth="2" />
          <circle cx="120" cy="200" r="10" fill="#CCFF00" opacity="0.9" />
          <text x="120" y="258" textAnchor="middle" fontSize="11" fill="#CCFF00" fontFamily="system-ui" fontWeight="700" opacity="0.8">BRAND</text>
        </g>

        {/* Creator Node (Right) */}
        <g className="conn-node" style={{ transformOrigin: "1080px 200px", opacity: 0 }} filter="url(#glow-soft)">
          <circle cx="1080" cy="200" r="40" fill="none" stroke="#60a5fa" strokeWidth="1.5" opacity="0.3" />
          <circle cx="1080" cy="200" r="28" fill="rgba(96,165,250,0.08)" stroke="#60a5fa" strokeWidth="2" />
          <circle cx="1080" cy="200" r="10" fill="#60a5fa" opacity="0.9" />
          <text x="1080" y="258" textAnchor="middle" fontSize="11" fill="#60a5fa" fontFamily="system-ui" fontWeight="700" opacity="0.8">CREATOR</text>
        </g>

        {/* Mid Node */}
        <g className="conn-node" style={{ transformOrigin: "600px 200px", opacity: 0 }} filter="url(#glow)">
          <circle cx="600" cy="200" r="20" fill="rgba(167,139,250,0.15)" stroke="#a78bfa" strokeWidth="2" />
          <circle cx="600" cy="200" r="7" fill="#a78bfa" opacity="0.9" />
          <text x="600" y="238" textAnchor="middle" fontSize="10" fill="#a78bfa" fontFamily="system-ui" fontWeight="700" opacity="0.8">SOCIALTIES</text>
        </g>

        {/* Main connector — arc through mid */}
        <path
          id="conn-path-1"
          d="M 148 200 Q 350 80 600 200 Q 850 320 1052 200"
          fill="none"
          stroke="url(#grad1)"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#glow)"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />

        {/* Secondary arc — opposite curve */}
        <path
          id="conn-path-2"
          d="M 148 200 Q 350 320 600 200 Q 850 80 1052 200"
          fill="none"
          stroke="url(#grad2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.6"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />

        {/* Tertiary small wave */}
        <path
          id="conn-path-3"
          d="M 200 200 C 300 150 400 250 500 200 S 700 150 800 200 S 950 250 1000 200"
          fill="none"
          stroke="url(#grad3)"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.5"
          style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
        />

        {/* Floating particles along path */}
        {[0, 1, 2, 3, 4].map((i) => (
          <circle
            key={i}
            className="conn-particle"
            cx={200 + i * 185}
            cy={180 + (i % 2 === 0 ? -20 : 20)}
            r="3"
            fill={i % 2 === 0 ? "#CCFF00" : "#60a5fa"}
            opacity="0"
            filter="url(#glow)"
            style={{ transition: "opacity 0.3s" }}
          />
        ))}

        {/* Subtle label hints */}
        <text x="340" y="110" textAnchor="middle" fontSize="9" fill="#a78bfa" fontFamily="system-ui" opacity="0.4" fontWeight="600">STRATEGY</text>
        <text x="860" y="110" textAnchor="middle" fontSize="9" fill="#a78bfa" fontFamily="system-ui" opacity="0.4" fontWeight="600">STORYTELLING</text>
        <text x="600" y="360" textAnchor="middle" fontSize="9" fill="#34d399" fontFamily="system-ui" opacity="0.4" fontWeight="600">AUTHENTIC CONNECTIONS</text>
      </svg>
    </div>
  );
}
