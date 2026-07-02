"use client";

import { useState, useTransition, useRef } from "react";
import { Plus, Trash2, X, Pencil, Search, FolderPlus, Image, Video, FileText } from "lucide-react";
import { adminPost, adminPut, adminDelete } from "@/lib/admin-fetch";

interface MediaFolder {
  id: string;
  name: string;
}

interface MediaItem {
  id: string;
  url: string;
  cloudinaryPublicId: string;
  type: string;
  sizeBytes: number | null;
  title: string | null;
  altText: string | null;
  tags: string[];
  folderId: string | null;
  folder?: { id: string; name: string } | null;
  createdAt: string;
}

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "VIDEO") return <Video size={20} className="text-blue-400" />;
  if (type === "DOCUMENT") return <FileText size={20} className="text-yellow-400" />;
  return <Image size={20} className="text-brand-lime" />;
};

function EditModal({ item, folders, onSave, onClose, submitting }: {
  item: MediaItem;
  folders: MediaFolder[];
  onSave: (id: string, data: { title: string; altText: string; tags: string; folderId: string }) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [title, setTitle] = useState(item.title ?? "");
  const [altText, setAltText] = useState(item.altText ?? "");
  const [tags, setTags] = useState((item.tags ?? []).join(", "));
  const [folderId, setFolderId] = useState(item.folderId ?? "");

  const input = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm";
  const lbl = "text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-elevated border border-border max-w-md w-full rounded-3xl p-6 relative shadow-2xl space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-fg-muted hover:text-foreground rounded-full border border-border transition-colors"><X size={16} /></button>
        <h3 className="text-xl font-black">Edit Media Metadata</h3>

        {/* Preview */}
        {item.type === "IMAGE" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.url} alt={item.altText ?? ""} className="w-full max-h-48 object-contain rounded-xl border border-border bg-background" />
        )}
        <p className="text-xs text-fg-muted font-mono break-all">{item.url}</p>

        <div>
          <label className={lbl}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
        </div>
        <div>
          <label className={lbl}>Alt Text</label>
          <input value={altText} onChange={(e) => setAltText(e.target.value)} className={input} />
        </div>
        <div>
          <label className={lbl}>Tags (comma separated)</label>
          <input value={tags} onChange={(e) => setTags(e.target.value)} className={input} />
        </div>
        <div>
          <label className={lbl}>Folder</label>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className={input}>
            <option value="">— No Folder —</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <button onClick={() => onSave(item.id, { title, altText, tags, folderId })} disabled={submitting}
          className="w-full py-3.5 bg-brand-lime hover:bg-brand-lime-dark text-black font-bold rounded-xl transition-all disabled:opacity-50">
          {submitting ? "Saving..." : "Save Metadata"}
        </button>
      </div>
    </div>
  );
}

function AddMediaModal({ folders, onAdd, onClose, submitting }: {
  folders: MediaFolder[];
  onAdd: (data: { url: string; cloudinaryPublicId: string; type: string; title: string; altText: string; folderId: string }) => void;
  onClose: () => void;
  submitting: boolean;
}) {
  const [url, setUrl] = useState("");
  const [publicId, setPublicId] = useState("");
  const [type, setType] = useState("IMAGE");
  const [title, setTitle] = useState("");
  const [altText, setAltText] = useState("");
  const [folderId, setFolderId] = useState("");

  const input = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm";
  const lbl = "text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5";

  // Auto-derive public ID from URL
  const handleUrlChange = (v: string) => {
    setUrl(v);
    if (!publicId) {
      const parts = v.split("/");
      const last = parts[parts.length - 1]?.split(".")?.[0] ?? "";
      if (last) setPublicId(last);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-elevated border border-border max-w-md w-full rounded-3xl p-6 relative shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-fg-muted hover:text-foreground rounded-full border border-border transition-colors"><X size={16} /></button>
        <h3 className="text-xl font-black">Add Media (URL)</h3>
        <p className="text-xs text-fg-muted">Paste a direct URL to an image, video, or document hosted on any CDN.</p>

        <div>
          <label className={lbl}>Media URL *</label>
          <input value={url} onChange={(e) => handleUrlChange(e.target.value)} placeholder="https://res.cloudinary.com/..." className={input} />
        </div>
        <div>
          <label className={lbl}>Public ID / Reference Key *</label>
          <input value={publicId} onChange={(e) => setPublicId(e.target.value)} placeholder="my-image-name" className={input} />
        </div>
        <div>
          <label className={lbl}>Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className={input}>
            <option value="IMAGE">Image</option>
            <option value="VIDEO">Video</option>
            <option value="DOCUMENT">Document</option>
          </select>
        </div>
        <div>
          <label className={lbl}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={input} />
        </div>
        <div>
          <label className={lbl}>Alt Text</label>
          <input value={altText} onChange={(e) => setAltText(e.target.value)} className={input} />
        </div>
        <div>
          <label className={lbl}>Folder</label>
          <select value={folderId} onChange={(e) => setFolderId(e.target.value)} className={input}>
            <option value="">— No Folder —</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        <button onClick={() => onAdd({ url, cloudinaryPublicId: publicId, type, title, altText, folderId })}
          disabled={submitting || !url || !publicId}
          className="w-full py-3.5 bg-brand-lime hover:bg-brand-lime-dark text-black font-bold rounded-xl transition-all disabled:opacity-50">
          {submitting ? "Adding..." : "Add to Library"}
        </button>
      </div>
    </div>
  );
}

export default function MediaLibraryClient({
  initialMedia, initialFolders,
}: {
  initialMedia: MediaItem[];
  initialFolders: MediaFolder[];
}) {
  const [media, setMedia] = useState(initialMedia);
  const [folders, setFolders] = useState(initialFolders);
  const [selectedFolder, setSelectedFolder] = useState<string | "">("");
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const filtered = media.filter((m) => {
    if (selectedFolder && m.folderId !== selectedFolder) return false;
    if (search && !m.title?.toLowerCase().includes(search.toLowerCase()) &&
      !m.altText?.toLowerCase().includes(search.toLowerCase()) &&
      !m.url.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const handleAdd = (data: any) => {
    setErr(null);
    startTransition(async () => {
      const res = await adminPost("/api/media", data);
      if (res.ok) { const m = await res.json(); setMedia((prev) => [m, ...prev]); setShowAdd(false); }
      else { const e = await res.json().catch(() => ({})); setErr(e.error ?? "Failed to add"); }
    });
  };

  const handleSaveMeta = (id: string, data: { title: string; altText: string; tags: string; folderId: string }) => {
    startTransition(async () => {
      const res = await adminPut(`/api/media/${id}`, {
        ...data,
        tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
        folderId: data.folderId || null,
      });
      if (res.ok) { const m = await res.json(); setMedia((prev) => prev.map((x) => x.id === m.id ? m : x)); setEditing(null); }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this media item?")) return;
    startTransition(async () => {
      const res = await adminDelete(`/api/media/${id}`);
      if (res.ok) setMedia((prev) => prev.filter((m) => m.id !== id));
    });
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    startTransition(async () => {
      const res = await adminPost("/api/media/folders", { name: newFolderName.trim() });
      if (res.ok) { const f = await res.json(); setFolders((prev) => [...prev, f]); setNewFolderName(""); setShowNewFolder(false); }
    });
  };

  const formatSize = (bytes: number | null) => {
    if (!bytes) return "";
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
    return `${(bytes / 1024).toFixed(0)}KB`;
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Search media..."
              className="pl-9 pr-4 py-2 text-sm bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-brand-lime w-56" />
          </div>
          <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}
            className="px-3 py-2 text-sm bg-bg-elevated border border-border rounded-xl focus:outline-none focus:border-brand-lime text-fg-muted">
            <option value="">All Folders</option>
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
          <button onClick={() => setShowNewFolder(!showNewFolder)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold border border-border rounded-xl text-fg-muted hover:text-brand-lime hover:border-brand-lime/40 transition-colors">
            <FolderPlus size={14} /> New Folder
          </button>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="px-4 py-2.5 bg-brand-lime text-black hover:bg-brand-lime-dark font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-lime/10">
          <Plus size={14} /> Add Media
        </button>
      </div>

      {/* New folder input */}
      {showNewFolder && (
        <div className="flex items-center gap-3 p-4 bg-bg-elevated border border-border rounded-2xl">
          <input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Folder name..."
            className="flex-1 px-4 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime"
            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()} />
          <button onClick={handleCreateFolder} disabled={!newFolderName.trim() || isPending}
            className="px-4 py-2 bg-brand-lime text-black text-sm font-bold rounded-xl disabled:opacity-50">Create</button>
          <button onClick={() => setShowNewFolder(false)} className="text-fg-muted hover:text-foreground"><X size={16} /></button>
        </div>
      )}

      {err && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{err}</div>}

      {/* Stats */}
      <p className="text-xs text-fg-muted">{filtered.length} item{filtered.length !== 1 ? "s" : ""} {search || selectedFolder ? "(filtered)" : "total"}</p>

      {/* Media grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.length === 0 && (
          <div className="col-span-full p-12 text-center text-fg-muted text-sm bg-bg-elevated border border-border rounded-3xl">
            {search || selectedFolder ? "No media matches this filter." : "No media yet. Add your first item."}
          </div>
        )}
        {filtered.map((m) => (
          <div key={m.id} className="group relative bg-bg-elevated border border-border rounded-2xl overflow-hidden hover:border-brand-lime/40 transition-all hover:shadow-lg">
            {/* Preview */}
            <div className="aspect-square flex items-center justify-center bg-background/50">
              {m.type === "IMAGE" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.url} alt={m.altText ?? ""} className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <TypeIcon type={m.type} />
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button onClick={() => setEditing(m)} className="p-2 bg-white/10 backdrop-blur rounded-lg border border-white/20 text-white hover:bg-white/20 transition-colors">
                <Pencil size={14} />
              </button>
              <button onClick={() => handleDelete(m.id)} disabled={isPending} className="p-2 bg-red-500/20 backdrop-blur rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>

            {/* Meta */}
            <div className="p-2">
              <p className="text-xs font-semibold truncate text-foreground">{m.title ?? m.url.split("/").pop()}</p>
              <p className="text-xs text-fg-muted">{m.type}{m.sizeBytes ? ` · ${formatSize(m.sizeBytes)}` : ""}</p>
            </div>
          </div>
        ))}
      </div>

      {showAdd && <AddMediaModal folders={folders} onAdd={handleAdd} onClose={() => setShowAdd(false)} submitting={isPending} />}
      {editing && <EditModal item={editing} folders={folders} onSave={handleSaveMeta} onClose={() => setEditing(null)} submitting={isPending} />}
    </div>
  );
}
