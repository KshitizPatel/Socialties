import TeamCrudClient from "@/components/admin/TeamCrudClient";
import { auth } from "@/auth";

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default async function AdminTeamPage() {
  const session = await auth();
  const token = (session?.user as any)?.accessToken;

  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let team = [];
  try {
    const res = await fetch(`${API_BASE}/api/team/all`, {
      cache: "no-store",
      headers,
    });
    if (res.ok) team = await res.json();
  } catch {
    // render with empty list on failure
  }

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-display font-black tracking-tight">Team Management</h1>
        <p className="text-sm text-fg-muted">Add, edit, and manage Socialties team members (including inactive).</p>
      </div>

      <TeamCrudClient initialTeam={team} />
    </div>
  );
}
