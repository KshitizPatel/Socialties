"use client";

import { useState, useTransition } from "react";
import {
  createCampaign, updateCampaign, deleteCampaign, toggleCampaignFeatured,
} from "@/app/admin/(protected)/campaigns/_actions/campaigns";
import { Plus, Trash2, X, Pencil, Star, StarOff, Eye } from "lucide-react";
import { CampaignType, CampaignStatus } from "@/lib/types";
import Link from "next/link";
import ImageUploader from "@/components/admin/ui/ImageUploader";

interface Campaign {
  id: string;
  brandName: string;
  slug: string;
  type: string;
  status: string;
  platforms: string[];
  reachTotal: string | null;
  budgetTier: string | null;
  featured: boolean;
  title: string | null;
  client: string | null;
  budget: number | null;
  category: string | null;
  coverImageUrl: string | null;
  brief: string | null;
  strategy: string | null;
  resultsNote: string | null;
  tags: string[];
  ctaText: string | null;
  ctaLink: string | null;
}

const PLATFORMS = ["INSTAGRAM", "YOUTUBE", "FACEBOOK", "TWITTER", "LINKEDIN", "TIKTOK"];

const emptyForm = {
  brandName: "", slug: "", type: "PRODUCT_LAUNCH" as CampaignType,
  status: "DRAFT" as CampaignStatus,
  platforms: [] as string[],
  reachTotal: "", budgetTier: "", coverImageUrl: "", coverImagePublicId: "",
  brief: "", strategy: "", resultsNote: "",
  title: "", client: "", budget: "", category: "",
  tags: "", ctaText: "", ctaLink: "",
  featured: false,
};

type FormState = typeof emptyForm;

function CampaignFormModal({
  title, initialForm, onSubmit, onClose, submitting,
}: {
  title: string;
  initialForm: FormState;
  onSubmit: (form: FormState) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const set = (key: keyof FormState, val: any) => setForm((f) => ({ ...f, [key]: val }));

  const togglePlat = (p: string) =>
    set("platforms", form.platforms.includes(p) ? form.platforms.filter((x) => x !== p) : [...form.platforms, p]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-elevated border border-border max-w-2xl w-full rounded-3xl p-6 sm:p-8 relative shadow-2xl max-h-[92vh] overflow-y-auto space-y-5">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-fg-muted hover:text-foreground rounded-full border border-border hover:bg-background transition-colors">
          <X size={16} />
        </button>
        <h3 className="text-2xl font-black text-foreground">{title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* Row 1 */}
          <Field label="Brand Name *"><input required value={form.brandName} onChange={(e) => set("brandName", e.target.value)} className={input} /></Field>
          <Field label="Slug *"><input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="brand-launch-2026" className={input} /></Field>

          {/* Row 2 */}
          <Field label="Campaign Type *">
            <select value={form.type} onChange={(e) => set("type", e.target.value as CampaignType)} className={input}>
              {Object.values(CampaignType).map((t) => <option key={t} value={t}>{t.replace(/_/g, " ")}</option>)}
            </select>
          </Field>
          <Field label="Status">
            <select value={form.status} onChange={(e) => set("status", e.target.value as CampaignStatus)} className={input}>
              {Object.values(CampaignStatus).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>

          {/* Row 3 */}
          <Field label="Title (display name)"><input value={form.title} onChange={(e) => set("title", e.target.value)} className={input} /></Field>
          <Field label="Client Name"><input value={form.client} onChange={(e) => set("client", e.target.value)} className={input} /></Field>

          {/* Row 4 */}
          <Field label="Budget Tier (display)"><input value={form.budgetTier} onChange={(e) => set("budgetTier", e.target.value)} placeholder="₹5L - ₹10L" className={input} /></Field>
          <Field label="Reach (number)"><input type="number" value={form.reachTotal} onChange={(e) => set("reachTotal", e.target.value)} placeholder="10000000" className={input} /></Field>

          {/* Row 5 */}
          <Field label="Category"><input value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Lifestyle, Tech..." className={input} /></Field>
          <Field label="Budget (₹ amount)"><input type="number" value={form.budget} onChange={(e) => set("budget", e.target.value)} className={input} /></Field>

          {/* Row 6 */}
          <Field label="CTA Text"><input value={form.ctaText} onChange={(e) => set("ctaText", e.target.value)} placeholder="View Campaign" className={input} /></Field>
          <Field label="CTA Link"><input value={form.ctaLink} onChange={(e) => set("ctaLink", e.target.value)} placeholder="https://..." className={input} /></Field>

          {/* Cover image — upload instead of URL */}
          <div className="sm:col-span-2">
            <ImageUploader
              label="Cover Image"
              folder="campaigns"
              value={form.coverImageUrl || null}
              publicId={form.coverImagePublicId || null}
              onChange={(url, publicId) => { set("coverImageUrl", url); set("coverImagePublicId", publicId); }}
              onRemove={() => { set("coverImageUrl", ""); set("coverImagePublicId", ""); }}
            />
          </div>

          {/* Tags */}
          <div className="sm:col-span-2">
            <Field label="Tags (comma separated)"><input value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="fashion, beauty, lifestyle" className={input} /></Field>
          </div>

          {/* Platforms */}
          <div className="sm:col-span-2 space-y-2">
            <label className={label}>Platforms *</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button key={p} type="button" onClick={() => togglePlat(p)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${form.platforms.includes(p) ? "bg-brand-lime text-black border-brand-lime" : "border-border text-fg-muted hover:border-brand-lime/40"}`}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Brief */}
          <div className="sm:col-span-2">
            <Field label="The Brief"><textarea rows={2} value={form.brief} onChange={(e) => set("brief", e.target.value)} className={textarea} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="The Strategy"><textarea rows={2} value={form.strategy} onChange={(e) => set("strategy", e.target.value)} className={textarea} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Results Note"><textarea rows={2} value={form.resultsNote} onChange={(e) => set("resultsNote", e.target.value)} className={textarea} /></Field>
          </div>

          {/* Featured toggle */}
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} className="accent-brand-lime w-4 h-4" />
              <span className="text-sm font-semibold">Featured on homepage</span>
            </label>
          </div>
        </div>

        <button
          onClick={() => onSubmit(form)}
          disabled={submitting || form.platforms.length === 0}
          className="w-full py-3.5 bg-brand-lime hover:bg-brand-lime-dark text-black font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center shadow-lg shadow-brand-lime/10 disabled:opacity-50">
          {submitting ? "Saving..." : "Save Campaign"}
        </button>
      </div>
    </div>
  );
}

const input = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm";
const textarea = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm resize-none";
const label = "text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5";
function Field({ label: l, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={label}>{l}</label>{children}</div>;
}

function campaignToForm(c: Campaign): FormState {
  return {
    brandName: c.brandName,
    slug: c.slug,
    type: c.type as CampaignType,
    status: c.status as CampaignStatus,
    platforms: c.platforms,
    reachTotal: c.reachTotal ?? "",
    budgetTier: c.budgetTier ?? "",
    coverImageUrl: c.coverImageUrl ?? "",
    coverImagePublicId: "",
    brief: c.brief ?? "",
    strategy: c.strategy ?? "",
    resultsNote: c.resultsNote ?? "",
    title: c.title ?? "",
    client: c.client ?? "",
    budget: c.budget !== null ? String(c.budget) : "",
    category: c.category ?? "",
    tags: (c.tags ?? []).join(", "),
    ctaText: c.ctaText ?? "",
    ctaLink: c.ctaLink ?? "",
    featured: c.featured,
  };
}

function formToPayload(form: FormState) {
  return {
    ...form,
    tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    reachTotal: form.reachTotal ? Number(form.reachTotal) : undefined,
    budget: form.budget ? Number(form.budget) : undefined,
  };
}

export default function CampaignsCrudClient({ initialCampaigns }: { initialCampaigns: Campaign[] }) {
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [showCreate, setShowCreate] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = (form: FormState) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await createCampaign(formToPayload(form));
      if (res.success) {
        setShowCreate(false);
        window.location.reload();
      } else {
        setErrorMsg(res.error ?? "Failed to create");
      }
    });
  };

  const handleUpdate = (form: FormState) => {
    if (!editCampaign) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateCampaign(editCampaign.id, formToPayload(form));
      if (res.success) {
        setEditCampaign(null);
        window.location.reload();
      } else {
        setErrorMsg(res.error ?? "Failed to update");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this campaign? It will be archived.")) return;
    startTransition(async () => {
      const res = await deleteCampaign(id);
      if (res.success) setCampaigns((prev) => prev.filter((c) => c.id !== id));
      else alert(res.error ?? "Delete failed");
    });
  };

  const handleToggleFeatured = (c: Campaign) => {
    startTransition(async () => {
      const res = await toggleCampaignFeatured(c.id, !c.featured);
      if (res.success) setCampaigns((prev) => prev.map((x) => x.id === c.id ? { ...x, featured: !c.featured } : x));
    });
  };

  const statusColors: Record<string, string> = {
    DRAFT: "bg-yellow-500/10 text-yellow-400",
    LIVE: "bg-green-500/10 text-green-400",
    COMPLETED: "bg-blue-500/10 text-blue-400",
    ARCHIVED: "bg-fg-muted/10 text-fg-muted",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Manage Campaigns ({campaigns.length})</h2>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-brand-lime text-black hover:bg-brand-lime-dark font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-lime/10">
          <Plus size={14} /> Add Campaign
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">{errorMsg}</div>
      )}

      <div className="bg-bg-elevated border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[700px]">
            <thead>
              <tr className="bg-background border-b border-border text-fg-muted uppercase tracking-wider font-semibold text-xs">
                <th className="p-4">Brand / Title</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Platforms</th>
                <th className="p-4">Featured</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {campaigns.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-fg-muted text-sm">No campaigns yet. Create the first one.</td></tr>
              )}
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-background/50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-foreground">{campaign.brandName}</p>
                    <p className="text-xs text-fg-muted font-mono">{campaign.slug}</p>
                  </td>
                  <td className="p-4 text-xs font-semibold text-fg-muted">{campaign.type.replace(/_/g, " ")}</td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${statusColors[campaign.status] ?? ""}`}>
                      {campaign.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-fg-muted">{campaign.platforms.join(", ")}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggleFeatured(campaign)} disabled={isPending}
                      className={`p-1.5 rounded-lg transition-colors ${campaign.featured ? "text-brand-lime bg-brand-lime/10" : "text-fg-muted hover:text-brand-lime"}`}>
                      {campaign.featured ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/campaigns/${campaign.slug}`} target="_blank"
                        className="p-2 border border-border text-fg-muted hover:text-brand-lime hover:border-brand-lime/40 rounded-xl transition-colors">
                        <Eye size={14} />
                      </Link>
                      <button onClick={() => setEditCampaign(campaign)}
                        className="p-2 border border-border text-fg-muted hover:text-blue-400 hover:border-blue-400/40 rounded-xl transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(campaign.id)} disabled={isPending}
                        className="p-2 border border-border text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && (
        <CampaignFormModal
          title="Add Campaign"
          initialForm={emptyForm}
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
          submitting={isPending}
        />
      )}

      {editCampaign && (
        <CampaignFormModal
          title={`Edit: ${editCampaign.brandName}`}
          initialForm={campaignToForm(editCampaign)}
          onSubmit={handleUpdate}
          onClose={() => setEditCampaign(null)}
          submitting={isPending}
        />
      )}
    </div>
  );
}
