import MediaLibraryClient from "@/components/admin/MediaLibraryClient";
import { auth } from "@/auth";

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminMediaPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let media = [];
  let folders = [];
  try {
    const [mediaRes, foldersRes] = await Promise.all([
      fetch(`${API_BASE}/api/media`, { cache: "no-store", headers }),
      fetch(`${API_BASE}/api/media/folders`, { cache: "no-store", headers }),
    ]);
    if (mediaRes.ok) media = await mediaRes.json();
    if (foldersRes.ok) folders = await foldersRes.json();
  } catch {
    // fail gracefully
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">Media Library</h1>
        <p className="text-sm text-fg-muted">Manage all images, videos, and documents used across the platform.</p>
      </div>
      <MediaLibraryClient initialMedia={media} initialFolders={folders} />
    </div>
  );
}
