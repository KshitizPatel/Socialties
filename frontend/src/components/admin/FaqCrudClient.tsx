"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, X, Save, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  isVisible: boolean;
}

interface Props { initialFaqs: FaqItem[]; }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const sessionRes = await fetch("/api/auth/session");
  const session = await sessionRes.json();
  const token = session?.user?.accessToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...opts, headers: { ...headers, ...(opts.headers as any) } });
}

const EMPTY: Omit<FaqItem, "id"> = { question: "", answer: "", sortOrder: 0, isVisible: true };

export default function FaqCrudClient({ initialFaqs }: Props) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<FaqItem> & { id?: string } }>({
    open: false, item: { ...EMPTY },
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const openCreate = () => setModal({ open: true, item: { ...EMPTY, sortOrder: faqs.length } });
  const openEdit = (faq: FaqItem) => setModal({ open: true, item: { ...faq } });
  const closeModal = () => setModal({ open: false, item: { ...EMPTY } });

  const handleSave = async () => {
    const { id, question, answer, sortOrder, isVisible } = modal.item;
    if (!question?.trim() || !answer?.trim()) { toast.error("Question and answer are required"); return; }
    setSaving(true);
    try {
      const method = id ? "PUT" : "POST";
      const url = id ? `/api/faq/${id}` : "/api/faq";
      const res = await apiFetch(url, { method, body: JSON.stringify({ question, answer, sortOrder, isVisible }) });
      if (!res.ok) throw new Error((await res.json()).error);
      const saved: FaqItem = await res.json();
      setFaqs((prev) => id ? prev.map((f) => f.id === id ? saved : f) : [...prev, saved]);
      toast.success(id ? "FAQ updated" : "FAQ created");
      closeModal();
    } catch (e: any) {
      toast.error(e.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (faq: FaqItem) => {
    if (!confirm(`Delete "${faq.question}"?`)) return;
    setDeleting(faq.id);
    try {
      const res = await apiFetch(`/api/faq/${faq.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setFaqs((prev) => prev.filter((f) => f.id !== faq.id));
      toast.success("FAQ deleted");
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  const toggleVisible = async (faq: FaqItem) => {
    try {
      const res = await apiFetch(`/api/faq/${faq.id}`, {
        method: "PUT",
        body: JSON.stringify({ isVisible: !faq.isVisible }),
      });
      if (!res.ok) throw new Error();
      const updated: FaqItem = await res.json();
      setFaqs((prev) => prev.map((f) => f.id === faq.id ? updated : f));
      toast.success(updated.isVisible ? "FAQ visible" : "FAQ hidden");
    } catch { toast.error("Failed to update"); }
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const newFaqs = [...faqs];
    const target = index + dir;
    if (target < 0 || target >= newFaqs.length) return;
    [newFaqs[index], newFaqs[target]] = [newFaqs[target], newFaqs[index]];
    const updated = newFaqs.map((f, i) => ({ ...f, sortOrder: i }));
    setFaqs(updated);
    try {
      await apiFetch("/api/faq/reorder", {
        method: "PATCH",
        body: JSON.stringify({ items: updated.map((f) => ({ id: f.id, sortOrder: f.sortOrder })) }),
      });
    } catch { toast.error("Reorder failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">{faqs.length} FAQ{faqs.length !== 1 ? "s" : ""}</p>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-brand-lime text-black rounded-xl font-bold text-sm hover:bg-brand-lime/90 transition-colors"
        >
          <Plus size={16} /> Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.length === 0 && (
          <div className="text-center py-16 text-fg-muted border border-dashed border-border rounded-2xl">
            No FAQs yet. Click "Add FAQ" to create one.
          </div>
        )}
        {faqs.map((faq, idx) => (
          <div
            key={faq.id}
            className={`bg-bg-elevated border rounded-2xl p-5 transition-colors ${faq.isVisible ? "border-border" : "border-border/40 opacity-60"}`}
          >
            <div className="flex items-start gap-4">
              {/* Order controls */}
              <div className="flex flex-col gap-0.5 pt-0.5">
                <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0} className="p-1 rounded hover:bg-white/5 disabled:opacity-30 text-fg-muted">
                  <ChevronUp size={14} />
                </button>
                <button onClick={() => moveOrder(idx, 1)} disabled={idx === faqs.length - 1} className="p-1 rounded hover:bg-white/5 disabled:opacity-30 text-fg-muted">
                  <ChevronDown size={14} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm leading-snug">{faq.question}</p>
                <p className="text-xs text-fg-muted mt-1 line-clamp-2">{faq.answer}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleVisible(faq)} className="p-2 rounded-lg hover:bg-white/5 text-fg-muted transition-colors" title={faq.isVisible ? "Hide" : "Show"}>
                  {faq.isVisible ? <Eye size={15} /> : <EyeOff size={15} />}
                </button>
                <button onClick={() => openEdit(faq)} className="p-2 rounded-lg hover:bg-brand-lime/10 text-brand-lime transition-colors">
                  <Pencil size={15} />
                </button>
                <button
                  onClick={() => handleDelete(faq)}
                  disabled={deleting === faq.id}
                  className="p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors disabled:opacity-50"
                >
                  {deleting === faq.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-black">{modal.item.id ? "Edit FAQ" : "Add FAQ"}</h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-bg-elevated text-fg-muted"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Question *</label>
                <input
                  value={modal.item.question || ""}
                  onChange={(e) => setModal((m) => ({ ...m, item: { ...m.item, question: e.target.value } }))}
                  placeholder="e.g. How do you select influencers?"
                  className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Answer *</label>
                <textarea
                  rows={5}
                  value={modal.item.answer || ""}
                  onChange={(e) => setModal((m) => ({ ...m, item: { ...m.item, answer: e.target.value } }))}
                  placeholder="Detailed answer…"
                  className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime resize-none"
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={modal.item.isVisible ?? true}
                    onChange={(e) => setModal((m) => ({ ...m, item: { ...m.item, isVisible: e.target.checked } }))} />
                  <div className={`w-10 h-6 rounded-full transition-colors ${modal.item.isVisible ? "bg-brand-lime" : "bg-border"}`} />
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-transform ${modal.item.isVisible ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-medium">Visible on website</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-bg-elevated">Cancel</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-brand-lime text-black rounded-xl font-bold text-sm hover:bg-brand-lime/90 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save FAQ"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
