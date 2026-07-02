"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";

interface ImageUploaderProps {
  value?: string | null;
  publicId?: string | null;
  onChange: (url: string, publicId: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  accept?: string;
  className?: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ImageUploader({
  value,
  publicId,
  onChange,
  onRemove,
  folder = "general",
  label = "Upload Image",
  accept = "image/jpeg,image/png,image/webp,image/gif,image/svg+xml",
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const doUpload = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);
      try {
        // Get session token
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();
        const token = session?.user?.accessToken;

        const form = new FormData();
        form.append("folder", folder);
        form.append("file", file);

        const res = await fetch(`${API_BASE}/api/upload`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: form,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Upload failed");
        }

        const data = await res.json();
        onChange(data.url, data.publicId);
      } catch (err: any) {
        setError(err.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    doUpload(files[0]);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [doUpload]
  );

  const handleDelete = async () => {
    if (!publicId) { onRemove?.(); return; }
    try {
      const sessionRes = await fetch("/api/auth/session");
      const session = await sessionRes.json();
      const token = session?.user?.accessToken;
      await fetch(`${API_BASE}/api/upload/${encodeURIComponent(publicId)}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {}
    onRemove?.();
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="text-xs font-semibold uppercase tracking-wider text-foreground">
          {label}
        </label>
      )}

      {/* Preview */}
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-border bg-bg-elevated">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className="w-full h-40 object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = "/placeholder-image.svg"; }}
          />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
              title="Replace image"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg text-white transition-colors"
              title="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : (
        /* Drop Zone */
        <div
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          className={`
            relative flex flex-col items-center justify-center gap-3 h-40 rounded-xl border-2 border-dashed
            cursor-pointer transition-all duration-200 select-none
            ${dragOver
              ? "border-brand-lime bg-brand-lime/5 scale-[1.01]"
              : "border-border hover:border-brand-lime/50 bg-bg-elevated hover:bg-bg-elevated/80"
            }
          `}
        >
          {uploading ? (
            <>
              <Loader2 size={28} className="text-brand-lime animate-spin" />
              <p className="text-xs text-fg-muted">Uploading…</p>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-brand-lime/10 text-brand-lime">
                <Upload size={22} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-foreground">
                  Drop image here or <span className="text-brand-lime">browse</span>
                </p>
                <p className="text-xs text-fg-muted mt-1">PNG, JPG, WebP, SVG — max 10 MB</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Replace button when image exists and uploading */}
      {value && uploading && (
        <div className="flex items-center gap-2 text-xs text-fg-muted">
          <Loader2 size={12} className="animate-spin" />
          Uploading new image…
        </div>
      )}

      {error && (
        <p className="text-xs text-red-500 flex items-center gap-1">
          <X size={12} /> {error}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
