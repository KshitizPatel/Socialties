"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, X, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { adminPost, adminPut, adminDelete } from "@/lib/admin-fetch";

interface Service {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  imageUrl: string | null;
  sortOrder: number;
  isActive: boolean;
}

const ICONS = ["Megaphone", "TrendingUp", "Video", "Camera", "Globe", "Smartphone", "Star", "Zap", "Target", "BarChart2", "Layers", "Code"];

const emptyForm = {
  slug: "", title: "", description: "", icon: "Star", imageUrl: "", sortOrder: 0, isActive: true,
};
type FormState = typeof emptyForm;

const input = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm";
const textarea = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm resize-none";
const lbl = "text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={lbl}>{label}</label>{children}</div>;
}

function ServiceModal({ title, initialForm, onSubmit, onClose, submitting }: {
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
          <Field label="Title *"><input required value={form.title} onChange={(e) => set("title", e.target.value)} className={input} /></Field>
          <Field label="Slug *"><input required value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="influencer-marketing" className={input} /></Field>
          <Field label="Icon">
            <select value={form.icon} onChange={(e) => set("icon", e.target.value)} className={input}>
              {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
            </select>
          </Field>
          <Field label="Sort Order"><input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className={input} /></Field>
          <div className="sm:col-span-2">
            <Field label="Description *"><textarea required rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} className={textarea} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Image URL (optional)"><input value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} className={input} /></Field>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="svcActive" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="accent-brand-lime w-4 h-4" />
            <label htmlFor="svcActive" className="text-sm font-semibold cursor-pointer">Active (visible on site)</label>
          </div>
        </div>

        <button onClick={() => onSubmit(form)} disabled={submitting || !form.title || !form.slug || !form.description}
          className="w-full py-3.5 bg-brand-lime hover:bg-brand-lime-dark text-black font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-brand-lime/10 disabled:opacity-50">
          {submitting ? "Saving..." : "Save Service"}
        </button>
      </div>
    </div>
  );
}

function serviceToForm(s: Service): FormState {
  return { slug: s.slug, title: s.title, description: s.description, icon: s.icon, imageUrl: s.imageUrl ?? "", sortOrder: s.sortOrder, isActive: s.isActive };
}

export default function ServicesClient({ initialServices }: { initialServices: Service[] }) {
  const [services, setServices] = useState(initialServices);
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);
  const [isPending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const handleCreate = (form: FormState) => {
    setErr(null);
    startTransition(async () => {
      const res = await adminPost("/api/services", form);
      if (res.ok) { const s = await res.json(); setServices((prev) => [...prev, s].sort((a, b) => a.sortOrder - b.sortOrder)); setShowCreate(false); }
      else { const e = await res.json().catch(() => ({})); setErr(e.error ?? "Failed"); }
    });
  };

  const handleUpdate = (form: FormState) => {
    if (!editing) return;
    setErr(null);
    startTransition(async () => {
      const res = await adminPut(`/api/services/${editing.id}`, form);
      if (res.ok) { const s = await res.json(); setServices((prev) => prev.map((x) => x.id === s.id ? s : x)); setEditing(null); }
      else { const e = await res.json().catch(() => ({})); setErr(e.error ?? "Failed"); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this service permanently?")) return;
    startTransition(async () => {
      const res = await adminDelete(`/api/services/${id}`);
      if (res.ok) setServices((prev) => prev.filter((s) => s.id !== id));
      else alert("Delete failed");
    });
  };

  const handleToggle = (s: Service) => {
    startTransition(async () => {
      const res = await adminPut(`/api/services/${s.id}`, { isActive: !s.isActive });
      if (res.ok) setServices((prev) => prev.map((x) => x.id === s.id ? { ...x, isActive: !s.isActive } : x));
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Services ({services.length})</h2>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-brand-lime text-black hover:bg-brand-lime-dark font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-lime/10">
          <Plus size={14} /> Add Service
        </button>
      </div>

      {err && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{err}</div>}

      <div className="bg-bg-elevated border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="bg-background border-b border-border text-fg-muted uppercase tracking-wider font-semibold text-xs">
                <th className="p-4">#</th>
                <th className="p-4">Service</th>
                <th className="p-4">Slug</th>
                <th className="p-4">Icon</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {services.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-fg-muted text-sm">No services configured.</td></tr>
              )}
              {services.map((s) => (
                <tr key={s.id} className="hover:bg-background/50 transition-colors">
                  <td className="p-4 text-fg-muted font-mono text-xs">{s.sortOrder}</td>
                  <td className="p-4">
                    <p className="font-bold text-foreground">{s.title}</p>
                    <p className="text-xs text-fg-muted line-clamp-1">{s.description}</p>
                  </td>
                  <td className="p-4 text-xs font-mono text-fg-muted">{s.slug}</td>
                  <td className="p-4 text-xs font-semibold text-fg-muted">{s.icon}</td>
                  <td className="p-4">
                    <button onClick={() => handleToggle(s)} disabled={isPending}
                      className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${s.isActive ? "text-green-400" : "text-fg-muted"}`}>
                      {s.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                      {s.isActive ? "Active" : "Hidden"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditing(s)} className="p-2 border border-border text-fg-muted hover:text-blue-400 hover:border-blue-400/40 rounded-xl transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => handleDelete(s.id)} disabled={isPending} className="p-2 border border-border text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showCreate && <ServiceModal title="Add Service" initialForm={emptyForm} onSubmit={handleCreate} onClose={() => setShowCreate(false)} submitting={isPending} />}
      {editing && <ServiceModal title={`Edit: ${editing.title}`} initialForm={serviceToForm(editing)} onSubmit={handleUpdate} onClose={() => setEditing(null)} submitting={isPending} />}
    </div>
  );
}
