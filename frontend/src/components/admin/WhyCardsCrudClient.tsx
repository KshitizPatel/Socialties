"use client";

import { useState } from "react";
import * as LucideIcons from "lucide-react";
import { Plus, Pencil, Trash2, Eye, EyeOff, ChevronUp, ChevronDown, X, Save, Loader2, HelpCircle } from "lucide-react";
import toast from "react-hot-toast";

interface WhyCard { id: string; title: string; description: string; icon: string; sortOrder: number; isVisible: boolean; }
interface Props { initialCards: WhyCard[]; }

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

async function apiFetch(path: string, opts: RequestInit = {}) {
  const session = await (await fetch("/api/auth/session")).json();
  const token = session?.user?.accessToken;
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(`${API_BASE}${path}`, { ...opts, headers });
}

const ICON_OPTIONS = [
  "Users", "Zap", "ShieldCheck", "CheckCircle2", "Layers", "BarChart3", "HelpCircle",
  "Star", "Award", "Target", "TrendingUp", "Heart", "Globe", "Lock", "Sparkles",
  "Rocket", "Eye", "Megaphone", "Handshake", "Clock",
];

const EMPTY = { title: "", description: "", icon: "Star", sortOrder: 0, isVisible: true };

export default function WhyCardsCrudClient({ initialCards }: Props) {
  const [cards, setCards] = useState<WhyCard[]>(initialCards);
  const [modal, setModal] = useState<{ open: boolean; item: Partial<WhyCard> & { id?: string } }>({ open: false, item: EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const openCreate = () => setModal({ open: true, item: { ...EMPTY, sortOrder: cards.length } });
  const openEdit = (c: WhyCard) => setModal({ open: true, item: { ...c } });
  const closeModal = () => setModal({ open: false, item: EMPTY });

  const handleSave = async () => {
    const { id, title, description, icon, sortOrder, isVisible } = modal.item;
    if (!title?.trim() || !description?.trim()) { toast.error("Title and description required"); return; }
    setSaving(true);
    try {
      const res = await apiFetch(id ? `/api/why-cards/${id}` : "/api/why-cards", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify({ title, description, icon, sortOrder, isVisible }),
      });
      if (!res.ok) throw new Error((await res.json()).error);
      const saved: WhyCard = await res.json();
      setCards((prev) => id ? prev.map((c) => c.id === id ? saved : c) : [...prev, saved]);
      toast.success(id ? "Card updated" : "Card created");
      closeModal();
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (card: WhyCard) => {
    if (!confirm(`Delete "${card.title}"?`)) return;
    setDeleting(card.id);
    try {
      await apiFetch(`/api/why-cards/${card.id}`, { method: "DELETE" });
      setCards((prev) => prev.filter((c) => c.id !== card.id));
      toast.success("Card deleted");
    } catch { toast.error("Failed to delete"); }
    finally { setDeleting(null); }
  };

  const toggleVisible = async (card: WhyCard) => {
    const res = await apiFetch(`/api/why-cards/${card.id}`, { method: "PUT", body: JSON.stringify({ isVisible: !card.isVisible }) });
    if (res.ok) { const u: WhyCard = await res.json(); setCards((prev) => prev.map((c) => c.id === card.id ? u : c)); }
  };

  const moveOrder = async (index: number, dir: -1 | 1) => {
    const arr = [...cards];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    const updated = arr.map((c, i) => ({ ...c, sortOrder: i }));
    setCards(updated);
    await apiFetch("/api/why-cards/reorder", { method: "PATCH", body: JSON.stringify({ items: updated.map((c) => ({ id: c.id, sortOrder: c.sortOrder })) }) });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-fg-muted">{cards.length} card{cards.length !== 1 ? "s" : ""}</p>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-brand-lime text-black rounded-xl font-bold text-sm hover:bg-brand-lime/90">
          <Plus size={16} /> Add Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.length === 0 && (
          <div className="col-span-3 text-center py-16 text-fg-muted border border-dashed border-border rounded-2xl">
            No cards yet. Click "Add Card".
          </div>
        )}
        {cards.map((card, idx) => {
          const Icon = (LucideIcons as any)[card.icon] || HelpCircle;
          return (
            <div key={card.id} className={`bg-bg-elevated border rounded-2xl p-5 space-y-3 transition-colors ${card.isVisible ? "border-border" : "border-border/40 opacity-60"}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="w-10 h-10 rounded-xl bg-brand-lime/10 flex items-center justify-center text-brand-lime shrink-0">
                  <Icon size={18} />
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => moveOrder(idx, -1)} disabled={idx === 0} className="p-1 text-fg-muted hover:text-foreground disabled:opacity-30"><ChevronUp size={13} /></button>
                  <button onClick={() => moveOrder(idx, 1)} disabled={idx === cards.length - 1} className="p-1 text-fg-muted hover:text-foreground disabled:opacity-30"><ChevronDown size={13} /></button>
                  <button onClick={() => toggleVisible(card)} className="p-1 text-fg-muted hover:text-foreground">{card.isVisible ? <Eye size={13} /> : <EyeOff size={13} />}</button>
                  <button onClick={() => openEdit(card)} className="p-1 text-brand-lime hover:text-brand-lime/80"><Pencil size={13} /></button>
                  <button onClick={() => handleDelete(card)} disabled={deleting === card.id} className="p-1 text-red-400 hover:text-red-300 disabled:opacity-50">
                    {deleting === card.id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-foreground">{card.title}</h4>
                <p className="text-xs text-fg-muted mt-1 line-clamp-2">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-black">{modal.item.id ? "Edit Card" : "Add Card"}</h2>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-bg-elevated text-fg-muted"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Title *</label>
                <input value={modal.item.title || ""} onChange={(e) => setModal((m) => ({ ...m, item: { ...m.item, title: e.target.value } }))}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Description *</label>
                <textarea rows={3} value={modal.item.description || ""} onChange={(e) => setModal((m) => ({ ...m, item: { ...m.item, description: e.target.value } }))}
                  className="w-full px-4 py-3 bg-bg-elevated border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime resize-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider">Icon (Lucide name)</label>
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                  {ICON_OPTIONS.map((name) => {
                    const Ico = (LucideIcons as any)[name] || HelpCircle;
                    return (
                      <button key={name} type="button" onClick={() => setModal((m) => ({ ...m, item: { ...m.item, icon: name } }))}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl text-xs border transition-colors ${modal.item.icon === name ? "border-brand-lime bg-brand-lime/10 text-brand-lime" : "border-border hover:border-brand-lime/30"}`}>
                        <Ico size={16} />
                        <span className="truncate w-full text-center">{name}</span>
                      </button>
                    );
                  })}
                </div>
                <input value={modal.item.icon || ""} onChange={(e) => setModal((m) => ({ ...m, item: { ...m.item, icon: e.target.value } }))}
                  placeholder="Or type any Lucide icon name"
                  className="w-full px-4 py-2 bg-bg-elevated border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-lime" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input type="checkbox" className="sr-only" checked={modal.item.isVisible ?? true} onChange={(e) => setModal((m) => ({ ...m, item: { ...m.item, isVisible: e.target.checked } }))} />
                  <div className={`w-10 h-6 rounded-full transition-colors ${modal.item.isVisible ? "bg-brand-lime" : "bg-border"}`} />
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-black transition-transform ${modal.item.isVisible ? "translate-x-5" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-medium">Visible on website</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-border">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-bg-elevated">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-brand-lime text-black rounded-xl font-bold text-sm hover:bg-brand-lime/90 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Saving…" : "Save Card"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
