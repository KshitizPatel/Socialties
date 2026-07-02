import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, BarChart2, Briefcase, Award, Instagram, Youtube, Globe } from "lucide-react";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await fetch(`${API_BASE}/api/campaigns/by-slug/${slug}`, { cache: "no-store" });
    if (!res.ok) return {};
    const campaign = await res.json();
    return {
      title: `${campaign.brandName} Campaign Case Study | Socialties`,
      description: campaign.resultsNote || `Read about the ${campaign.brandName} campaign execution.`,
    };
  } catch {
    return {};
  }
}

export const revalidate = 60;

export default async function CampaignDetailPage({ params }: Props) {
  const { slug } = await params;
  let campaign: any = null;
  try {
    const res = await fetch(`${API_BASE}/api/campaigns/by-slug/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) campaign = await res.json();
  } catch {
    // fall through to notFound
  }

  if (!campaign) {
    notFound();
  }

  // reachTotal comes as string from API (serialized BigInt)
  const formatReach = (num: string | null) => {
    if (!num) return "N/A";
    const n = Number(num);
    if (n >= 10000000) return (n / 10000000).toFixed(0) + "Cr+";
    if (n >= 1000000) return (n / 1000000).toFixed(0) + "M+";
    return n.toLocaleString();
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toUpperCase()) {
      case "INSTAGRAM":
        return <Instagram size={16} className="text-pink-500" />;
      case "YOUTUBE":
        return <Youtube size={16} className="text-red-500" />;
      default:
        return <Globe size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto space-y-12">
      {/* Back button */}
      <div>
        <Link
          href="/campaigns"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-fg-muted hover:text-foreground transition-colors group"
        >
          <ArrowLeft size={16} className="transform group-hover:-translate-x-1 transition-transform" />
          <span>Back to Campaigns</span>
        </Link>
      </div>

      {/* Hero Banner / Cover */}
      <div className="relative aspect-[21/9] w-full rounded-3xl overflow-hidden border border-border bg-bg-elevated">
        {campaign.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.coverImageUrl}
            alt={campaign.brandName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-violet/20 to-brand-ink/90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-8 text-white space-y-2">
          <span className="px-3 py-1 bg-brand-lime/10 border border-brand-lime/30 text-brand-lime text-xs font-semibold rounded-lg uppercase tracking-wide">
            {campaign.type.replace("_", " ")}
          </span>
          <h1 className="text-3xl sm:text-5xl font-display font-black tracking-tight">
            {campaign.brandName}
          </h1>
        </div>
      </div>

      {/* Metadata Row Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-bg-elevated border border-border p-5 rounded-2xl space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-fg-muted">
            <Award size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Scale</span>
          </div>
          <p className="font-bold text-foreground">{campaign.budgetTier || "Premium"}</p>
        </div>

        <div className="bg-bg-elevated border border-border p-5 rounded-2xl space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-fg-muted">
            <BarChart2 size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Reach</span>
          </div>
          <p className="font-bold text-brand-lime">{formatReach(campaign.reachTotal)}</p>
        </div>

        <div className="bg-bg-elevated border border-border p-5 rounded-2xl space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-fg-muted">
            <Calendar size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Duration</span>
          </div>
          <p className="font-bold text-foreground">
            {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : "N/A"}
          </p>
        </div>

        <div className="bg-bg-elevated border border-border p-5 rounded-2xl space-y-1.5 shadow-sm">
          <div className="flex items-center space-x-2 text-fg-muted">
            <Briefcase size={16} />
            <span className="text-xs font-semibold uppercase tracking-wider">Platforms</span>
          </div>
          <div className="flex items-center gap-2 pt-0.5">
            {campaign.platforms.map((platform: string) => (
              <div
                key={platform}
                className="flex items-center space-x-1.5 px-2.5 py-1 bg-background border border-border rounded-lg text-xs"
              >
                {getPlatformIcon(platform)}
                <span className="font-semibold">{platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Brief / Strategy / Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-4">
        {/* Narrative columns */}
        <div className="lg:col-span-2 space-y-10">
          {campaign.brief && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground">
                The Brief
              </h2>
              <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">
                {campaign.brief}
              </p>
            </div>
          )}

          {campaign.strategy && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground">
                The Strategy
              </h2>
              <p className="text-sm text-fg-muted leading-relaxed whitespace-pre-wrap">
                {campaign.strategy}
              </p>
            </div>
          )}
        </div>

        {/* Results stats */}
        <div className="bg-brand-ink-soft border border-white/5 rounded-3xl p-8 text-white space-y-6 self-start lg:sticky lg:top-24">
          <h3 className="text-lg font-bold text-brand-lime border-b border-white/10 pb-2">
            Campaign Results
          </h3>
          <p className="text-sm text-fg-muted leading-relaxed">
            {campaign.resultsNote || "Outstanding execution delivering target conversion goals and authentic audience engagement."}
          </p>

          {campaign.metrics && (
            <div className="space-y-4 pt-2">
              {Object.entries(campaign.metrics as Record<string, string>).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center text-sm">
                  <span className="text-fg-muted capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                  <span className="font-bold text-brand-lime">{val}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Media Gallery Grid */}
      {(campaign.images.length > 0 || campaign.videos.length > 0) && (
        <div className="space-y-6 pt-8">
          <h2 className="text-xl font-bold border-b border-border pb-2 text-foreground">
            Media Gallery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {campaign.images.map((image: any) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-bg-elevated hover:-translate-y-1 transition-transform"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.altText || campaign.brandName}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}

            {campaign.videos.map((video: any) => (
              <div
                key={video.id}
                className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-bg-elevated hover:-translate-y-1 transition-transform"
              >
                {video.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={video.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-brand-ink-soft flex items-center justify-center text-brand-lime">
                    <BarChart2 size={24} />
                  </div>
                )}
                {/* Play button overlay */}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-85 hover:opacity-100 transition-opacity">
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-3 bg-brand-lime text-black rounded-full hover:scale-105 transition-transform"
                  >
                    <BarChart2 size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
