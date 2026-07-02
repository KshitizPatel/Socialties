"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, X, Pencil, Eye, EyeOff, Star } from "lucide-react";
import { adminPost, adminPut, adminDelete } from "@/lib/admin-fetch";

interface Testimonial {
  id: string;
  authorName: string;
  authorRole: string | null;
  companyName: string | null;
  content: string | null;
  videoUrl: string | null;
  rating: number | null;
  type: string;
  audience: string;
  campaignId: string | null;
  isPublished: boolean;
  sortOrder: number;
}

const emptyForm = {
  authorName: "", authorRole: "", companyName: "", content: "", videoUrl: "",
  rating: "", type: "TEXT", audience: "BRAND", isPublished: true, sortOrder: 0,
};

type FormState = typeof emptyForm;

const input = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm";
const textarea = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm resize-none";
const lbl = "text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={lbl}>{label}</label>{children}</div>;
}

function TestimonialModal({ title, initialForm, onSubmit, onClose, submitting }: {
  title: string; initialForm: FormState; onSubmit: (f: FormState) => void; onClose: () => void; submitting: boolean;
}) {
  const [form, setForm] = useState<FormState>(initialForm);
  const set = (k: keyof FormState, v: any) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-elevated border border-border max-w-xl w-full rounded-3xl p-6 sm:p-8 relative shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-fg-muted hover:text-foreground rounded-full border border-border hover:bg-background transition-colors"><X size={16} /></button>
        <h3 className="text-2xl font-black">{title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Author Name *"><input required value={form.authorName} onChange={(e) => set("authorName", e.target.value)} className={input} /></Field>
          <Field label="Author Role / Title"><input value={form.authorRole} onChange={(e) => set("authorRole", e.target.value)} placeholder="CEO, Marketing Head..." className={input} /></Field>
          <Field label="Company"><input value={form.companyName} onChange={(e) => set("companyName", e.target.value)} className={input} /></Field>
          <Field label="Rating (1-5)"><input type="number" min="1" max="5" value={form.rating} onChange={(e) => set("rating", e.target.value)} className={input} /></Field>
          <Field label="Type">
            <select value={form.type} onChange={(e) => set("type", e.target.value)} className={input}>
              <option value="TEXT">Text</option>
              <option value="VIDEO">Video</option>
            </select>
          </Field>
          <Field label="Audience">
            <select value={form.audience} onChange={(e) => set("audience", e.target.value)} className={input}>
              <option value="BRAND">Brand</option>
              <option value="CREATOR">Creator</option>
            </select>
          </Field>
          {form.type === "VIDEO" && (
            <div className="sm:col-span-2">
              <Field label="Video URL"><input value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} className={input} /></Field>
            </div>
          )}
          <div className="sm:col-span-2">
            <Field label="Testimonial Text"><textarea rows={4} value={form.content} onChange={(e) => set("content", e.target.value)} className={textarea} /></Field>
          </div>
          <Field label="Sort Order"><input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className={input} /></Field>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="tPub" checked={form.isPublished} onChange={(e) => set("isPublished", e.target.checked)} className="accent-brand-lime w-4 h-4" />
            <label htmlFor="tPub" className="text-sm font-semibold cursor-pointer">Published (visible on site)</label>
          </div>
        </div>

        <button onClick={() => onSubmit(form)} disabled={submitting || !form.authorName}
          className="w-full py-3.5 bg-brand-lime hover:bg-brand-lime-dark text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-lime/10 disabled:opacity-50">
          {submitting ? "Saving..." : "Save Testimonial"}
        </button>
      </div>
    </div>
  );
}

function testimonialToForm(t: Testimonial): FormState {
  return {
    authorName: t.authorName, authorRole: t.authorRole ?? "", companyName: t.companyName ?? "",
    content: t.content ?? "", videoUrl: t.videoUrl ?? "", rating: t.rating ? String(t.rating) : "",
    type: t.type, audience: t.audience, isPublished: t.isPublished, sortOrder: t.sortOrder,
  };
}

export default function TestimonialsClient({ initialTestimonials }: { initialTestimonials: Testimonial[] }) {
  const [testimonials, setTestimonials] = useState(initialTestimonials);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Testimonial | null>(null);
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = (form: FormState) => {
    setErr(null);
    startTransition(async () => {
      const res = await adminPost("/api/testimonials", { ...form, rating: form.rating ? Number(form.rating) : null });
      if (res.ok) { const t = await res.json(); setTestimonials((prev) => [t, ...prev]); setShowCreate(false); }
      else { const e = await res.json().catch(() => ({})); setErr(e.error ?? "Failed"); }
    });
  };

  const handleUpdate = (form: FormState) => {
    if (!editing) return;
    setErr(null);
    startTransition(async () => {
      const res = await adminPut(`/api/testimonials/${editing.id}`, { ...form, rating: form.rating ? Number(form.rating) : null });
      if (res.ok) { const t = await res.json(); setTestimonials((prev) => prev.map((x) => x.id === t.id ? t : x)); setEditing(null); }
      else { const e = await res.json().catch(() => ({})); setErr(e.error ?? "Failed"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    startTransition(async () => {
      const res = await adminDelete(`/api/testimonials/${id}`);
      if (res.ok) setTestimonials((prev) => prev.filter((t) => t.id !== id));
      else alert("Delete failed");
    });
  };

  const handleTogglePublish = (t: Testimonial) => {
    startTransition(async () => {
      const res = await adminPut(`/api/testimonials/${t.id}`, { isPublished: !t.isPublished });
      if (res.ok) setTestimonials((prev) => prev.map((x) => x.id === t.id ? { ...x, isPublished: !t.isPublished } : x));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Testimonials ({testimonials.length})</h2>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-brand-lime text-black hover:bg-brand-lime-dark font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-lime/10">
          <Plus size={14} /> Add Testimonial
        </button>
      </div>

      {err && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{err}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.length === 0 && (
          <div className="md:col-span-2 p-12 text-center text-fg-muted text-sm bg-bg-elevated border border-border rounded-3xl">No testimonials yet.</div>
        )}
        {testimonials.map((t) => (
          <div key={t.id} className={`bg-bg-elevated border rounded-2xl p-5 space-y-3 transition-colors ${t.isPublished ? "border-border" : "border-border/50 opacity-60"}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-foreground">{t.authorName}</p>
                <p className="text-xs text-fg-muted">{t.authorRole ?? ""}{t.companyName ? ` · ${t.companyName}` : ""}</p>
              </div>
              <div className="flex items-center gap-1.5">
                {t.rating && Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={12} className="text-yellow-400" fill="currentColor" />
                ))}
              </div>
            </div>
            {t.content && <p className="text-sm text-fg-muted italic line-clamp-2">"{t.content}"</p>}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-background border border-border text-fg-muted">{t.audience}</span>
                <span className="text-xs px-2 py-0.5 rounded-md font-bold bg-background border border-border text-fg-muted">{t.type}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTogglePublish(t)} disabled={isPending}
                  className={`p-1.5 rounded-lg transition-colors ${t.isPublished ? "text-green-400 bg-green-500/10" : "text-fg-muted hover:text-green-400"}`}>
                  {t.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button onClick={() => setEditing(t)} className="p-1.5 border border-border text-fg-muted hover:text-blue-400 hover:border-blue-400/40 rounded-lg transition-colors"><Pencil size={14} /></button>
                <button onClick={() => handleDelete(t.id)} disabled={isPending} className="p-1.5 border border-border text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showCreate && <TestimonialModal title="Add Testimonial" initialForm={emptyForm} onSubmit={handleCreate} onClose={() => setShowCreate(false)} submitting={isPending} />}
      {editing && <TestimonialModal title={`Edit: ${editing.authorName}`} initialForm={testimonialToForm(editing)} onSubmit={handleUpdate} onClose={() => setEditing(null)} submitting={isPending} />}
    </div>
  );
}
