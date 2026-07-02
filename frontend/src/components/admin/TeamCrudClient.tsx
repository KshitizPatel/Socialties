"use client";

import { useState, useTransition } from "react";
import {
  createTeamMember, updateTeamMember, deleteTeamMember,
} from "@/app/admin/(protected)/team/_actions/team";
import { Plus, Trash2, X, Pencil, Instagram, Linkedin, Mail } from "lucide-react";
import ImageUploader from "@/components/admin/ui/ImageUploader";

interface TeamMember {
  id: string;
  name: string;
  designation: string;
  photoUrl: string | null;
  linkedin: string | null;
  instagram: string | null;
  email: string | null;
  bio: string | null;
  phone: string | null;
  department: string | null;
  portfolio: string | null;
  experience: string | null;
  sortOrder: number;
  isActive: boolean;
}

const emptyForm = {
  name: "", designation: "", photoUrl: "", photoPublicId: "", linkedin: "", instagram: "",
  email: "", bio: "", phone: "", department: "", portfolio: "", experience: "",
  sortOrder: 0, isActive: true,
};

type FormState = typeof emptyForm;

const input = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm";
const textarea = "w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:border-brand-lime text-sm resize-none";
const lbl = "text-xs font-semibold text-fg-muted uppercase tracking-wider block mb-1.5";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className={lbl}>{label}</label>{children}</div>;
}

function TeamFormModal({
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-bg-elevated border border-border max-w-xl w-full rounded-3xl p-6 sm:p-8 relative shadow-2xl max-h-[92vh] overflow-y-auto space-y-4">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-fg-muted hover:text-foreground rounded-full border border-border hover:bg-background transition-colors">
          <X size={16} />
        </button>
        <h3 className="text-2xl font-black text-foreground">{title}</h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <Field label="Name *"><input required value={form.name} onChange={(e) => set("name", e.target.value)} className={input} /></Field>
          <Field label="Designation *"><input required value={form.designation} onChange={(e) => set("designation", e.target.value)} className={input} placeholder="Head of Marketing" /></Field>
          <Field label="Department"><input value={form.department} onChange={(e) => set("department", e.target.value)} className={input} placeholder="Marketing" /></Field>
          <Field label="Experience"><input value={form.experience} onChange={(e) => set("experience", e.target.value)} className={input} placeholder="5+ years" /></Field>
          <Field label="Email"><input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} className={input} /></Field>
          <Field label="Phone"><input value={form.phone} onChange={(e) => set("phone", e.target.value)} className={input} /></Field>
          <Field label="LinkedIn URL"><input value={form.linkedin} onChange={(e) => set("linkedin", e.target.value)} className={input} /></Field>
          <Field label="Instagram URL"><input value={form.instagram} onChange={(e) => set("instagram", e.target.value)} className={input} /></Field>
          <div className="sm:col-span-2">
            <ImageUploader
              label="Photo"
              folder="team"
              value={form.photoUrl || null}
              publicId={form.photoPublicId || null}
              onChange={(url, publicId) => { set("photoUrl", url); set("photoPublicId", publicId); }}
              onRemove={() => { set("photoUrl", ""); set("photoPublicId", ""); }}
            />
          </div>
          <div className="sm:col-span-2">
            <Field label="Portfolio URL"><input value={form.portfolio} onChange={(e) => set("portfolio", e.target.value)} className={input} /></Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Bio"><textarea rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} className={textarea} /></Field>
          </div>
          <Field label="Sort Order"><input type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", Number(e.target.value))} className={input} /></Field>
          <div className="flex items-center gap-2 pt-5">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => set("isActive", e.target.checked)} className="accent-brand-lime w-4 h-4" />
            <label htmlFor="isActive" className="text-sm font-semibold cursor-pointer">Active (visible on site)</label>
          </div>
        </div>

        <button onClick={() => onSubmit(form)} disabled={submitting || !form.name || !form.designation}
          className="w-full py-3.5 bg-brand-lime hover:bg-brand-lime-dark text-black font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center shadow-lg shadow-brand-lime/10 disabled:opacity-50">
          {submitting ? "Saving..." : "Save Member"}
        </button>
      </div>
    </div>
  );
}

function memberToForm(m: TeamMember): FormState {
  return {
    name: m.name, designation: m.designation, photoUrl: m.photoUrl ?? "", photoPublicId: "",
    linkedin: m.linkedin ?? "", instagram: m.instagram ?? "", email: m.email ?? "",
    bio: m.bio ?? "", phone: m.phone ?? "", department: m.department ?? "",
    portfolio: m.portfolio ?? "", experience: m.experience ?? "",
    sortOrder: m.sortOrder, isActive: m.isActive,
  };
}

export default function TeamCrudClient({ initialTeam }: { initialTeam: TeamMember[] }) {
  const [team, setTeam] = useState(initialTeam);
  const [showCreate, setShowCreate] = useState(false);
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreate = (form: FormState) => {
    setErrorMsg(null);
    startTransition(async () => {
      const res = await createTeamMember(form);
      if (res.success) { setShowCreate(false); window.location.reload(); }
      else setErrorMsg(res.error ?? "Failed");
    });
  };

  const handleUpdate = (form: FormState) => {
    if (!editMember) return;
    setErrorMsg(null);
    startTransition(async () => {
      const res = await updateTeamMember(editMember.id, form);
      if (res.success) { setEditMember(null); window.location.reload(); }
      else setErrorMsg(res.error ?? "Failed");
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Remove this team member?")) return;
    startTransition(async () => {
      const res = await deleteTeamMember(id);
      if (res.success) setTeam((prev) => prev.filter((m) => m.id !== id));
      else alert(res.error ?? "Delete failed");
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Team Members ({team.length})</h2>
        <button onClick={() => setShowCreate(true)}
          className="px-4 py-2.5 bg-brand-lime text-black hover:bg-brand-lime-dark font-semibold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition-all shadow-md shadow-brand-lime/10">
          <Plus size={14} /> Add Member
        </button>
      </div>

      {errorMsg && <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm font-medium">{errorMsg}</div>}

      <div className="bg-bg-elevated border border-border rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm min-w-[600px]">
            <thead>
              <tr className="bg-background border-b border-border text-fg-muted uppercase tracking-wider font-semibold text-xs">
                <th className="p-4">Member</th>
                <th className="p-4">Role / Dept</th>
                <th className="p-4">Contact</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/10">
              {team.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-fg-muted text-sm">No team members yet.</td></tr>
              )}
              {team.map((member) => (
                <tr key={member.id} className="hover:bg-background/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {member.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={member.photoUrl} alt={member.name} className="w-9 h-9 rounded-full object-cover border border-border" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-brand-lime/10 border border-brand-lime/20 flex items-center justify-center text-brand-lime font-bold text-sm">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-foreground">{member.name}</p>
                        <p className="text-xs text-fg-muted">{member.experience ?? ""}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-medium text-sm">{member.designation}</p>
                    <p className="text-xs text-fg-muted">{member.department ?? ""}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {member.email && <a href={`mailto:${member.email}`} className="text-fg-muted hover:text-brand-lime transition-colors"><Mail size={14} /></a>}
                      {member.linkedin && <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-fg-muted hover:text-blue-400 transition-colors"><Linkedin size={14} /></a>}
                      {member.instagram && <a href={member.instagram} target="_blank" rel="noreferrer" className="text-fg-muted hover:text-pink-400 transition-colors"><Instagram size={14} /></a>}
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`text-xs px-2 py-0.5 rounded-md font-bold ${member.isActive ? "bg-green-500/10 text-green-400" : "bg-fg-muted/10 text-fg-muted"}`}>
                      {member.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditMember(member)}
                        className="p-2 border border-border text-fg-muted hover:text-blue-400 hover:border-blue-400/40 rounded-xl transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} disabled={isPending}
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

      {showCreate && <TeamFormModal title="Add Team Member" initialForm={emptyForm} onSubmit={handleCreate} onClose={() => setShowCreate(false)} submitting={isPending} />}
      {editMember && <TeamFormModal title={`Edit: ${editMember.name}`} initialForm={memberToForm(editMember)} onSubmit={handleUpdate} onClose={() => setEditMember(null)} submitting={isPending} />}
    </div>
  );
}
