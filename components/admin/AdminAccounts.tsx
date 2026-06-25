"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createAdminUser, updateAdminRole, deleteAdminUser, type AdminActionState, type AdminUser } from "@/app/admin/admins/actions";
import type { AdminRole } from "@/lib/supabase/admin-guard";

const ROLE_LABEL: Record<AdminRole, string> = {
  super_admin: "Super-admin",
  manager: "Management",
};

function RoleBadge({ role }: { role: AdminRole }) {
  const isSuper = role === "super_admin";
  return (
    <span
      className="font-sans text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap"
      style={{
        borderColor: isSuper ? "var(--rose)" : "var(--line)",
        background: isSuper ? "#F8ECEA" : "transparent",
        color: isSuper ? "var(--rose)" : "var(--plum-soft)",
      }}
    >
      {ROLE_LABEL[role]}
    </span>
  );
}

/* ============================================================
   Modal trigger — lives in the AdminShell header (top-right CTA)
   while the modal itself lives in the provider below them both.
   ============================================================ */
const OpenModalCtx = createContext<() => void>(() => {});

export function AddMemberButton() {
  const open = useContext(OpenModalCtx);
  return (
    <button type="button" onClick={open} className="btn btn-primary">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M12 5v14M5 12h14" />
      </svg>
      Add member
    </button>
  );
}

export function AdminAccountsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  // Bump on each open so the modal remounts — a fresh form, no stale success.
  const [instance, setInstance] = useState(0);
  const show = useCallback(() => {
    setInstance((n) => n + 1);
    setOpen(true);
  }, []);
  return (
    <OpenModalCtx.Provider value={show}>
      {children}
      <AddMemberModal key={instance} open={open} onClose={() => setOpen(false)} />
    </OpenModalCtx.Provider>
  );
}

/* ============================================================
   Roster table
   ============================================================ */
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function UserRow({ user, isSelf }: { user: AdminUser; isSelf: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <tr className="border-b last:border-b-0" style={{ borderColor: "var(--line)", opacity: pending ? 0.5 : 1 }}>
      <td className="px-4 md:px-5 py-3.5 align-middle">
        <span className="font-sans text-sm text-plum block truncate max-w-[240px] md:max-w-none">
          {user.email}
          {isSelf && <span className="text-plum-soft"> (you)</span>}
        </span>
        <span className="sm:hidden mt-1.5 inline-block"><RoleBadge role={user.role} /></span>
      </td>
      <td className="hidden sm:table-cell px-4 md:px-5 py-3.5 align-middle">
        {isSelf ? (
          <RoleBadge role={user.role} />
        ) : (
          <select
            value={user.role}
            disabled={pending}
            onChange={(e) => startTransition(() => updateAdminRole(user.id, e.target.value as AdminRole))}
            className="field-select !py-1.5 !min-h-0 !text-xs w-auto"
            aria-label={`Role for ${user.email}`}
          >
            <option value="manager">Management</option>
            <option value="super_admin">Super-admin</option>
          </select>
        )}
      </td>
      <td className="hidden md:table-cell px-4 md:px-5 py-3.5 align-middle font-sans text-xs text-plum-soft tabular-nums whitespace-nowrap">
        {formatDate(user.created_at)}
      </td>
      <td className="px-4 md:px-5 py-3.5 align-middle text-right">
        {isSelf ? (
          <span className="font-sans text-xs text-plum-soft">—</span>
        ) : confirming ? (
          <span className="inline-flex items-center gap-1.5 justify-end">
            <button
              type="button"
              onClick={() => startTransition(() => deleteAdminUser(user.id))}
              disabled={pending}
              className="act act-sm act-danger"
            >
              Remove
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="act act-sm act-ghost">
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Remove ${user.email}`}
            className="p-2 rounded-md text-plum-soft hover:text-rose transition-colors"
            title="Remove"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
              <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V6" />
            </svg>
          </button>
        )}
      </td>
    </tr>
  );
}

export function AdminAccountsTable({ users, currentUserId }: { users: AdminUser[]; currentUserId: string }) {
  const superCount = users.filter((u) => u.role === "super_admin").length;
  return (
    <div className="surface-card overflow-hidden max-w-[860px]">
      <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-b" style={{ borderColor: "var(--line)" }}>
        <span className="font-sans text-[11px] tracking-[0.1em] uppercase text-plum-soft">
          Team · {users.length}
        </span>
        <span className="font-sans text-[11px] text-plum-soft">
          {superCount} super-admin{superCount === 1 ? "" : "s"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--line)" }}>
              <th className="px-4 md:px-5 py-2.5 text-left font-sans text-[10px] tracking-[0.12em] uppercase text-plum-soft font-normal">Member</th>
              <th className="hidden sm:table-cell px-4 md:px-5 py-2.5 text-left font-sans text-[10px] tracking-[0.12em] uppercase text-plum-soft font-normal">Role</th>
              <th className="hidden md:table-cell px-4 md:px-5 py-2.5 text-left font-sans text-[10px] tracking-[0.12em] uppercase text-plum-soft font-normal">Added</th>
              <th className="px-4 md:px-5 py-2.5 text-right font-sans text-[10px] tracking-[0.12em] uppercase text-plum-soft font-normal">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} isSelf={u.id === currentUserId} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================================================
   Add-member modal — sends a Supabase invite; the member sets
   their own password via the emailed link.
   ============================================================ */
function AddMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(createAdminUser, {});
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const justSucceeded = state.ok;

  // Focus the first field once the panel is on screen.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => firstFieldRef.current?.focus(), 60);
    return () => clearTimeout(t);
  }, [open]);

  // After a successful invite, pull the refreshed roster into the table.
  useEffect(() => {
    if (state.ok) router.refresh();
  }, [state.ok, router]);

  // Escape to close + lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const headingId = useMemo(() => "add-member-heading", []);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto modal-backdrop"
      style={{ background: "rgba(43, 27, 36, 0.46)", backdropFilter: "blur(3px)" }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="surface-card w-full max-w-[480px] my-auto modal-panel"
        style={{ boxShadow: "0 30px 70px rgba(43,27,36,0.32)" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-4 border-b" style={{ borderColor: "var(--line)" }}>
          <div>
            <p className="eyebrow mb-1.5">{justSucceeded ? "Invitation sent" : "New teammate"}</p>
            <h2 id={headingId} className="font-serif text-plum text-2xl leading-tight">
              {justSucceeded ? "On its way." : "Invite a team member"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 -mr-1.5 rounded-md text-plum-soft hover:text-plum hover:bg-cream transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {justSucceeded ? (
          <SuccessPanel state={state} onClose={onClose} />
        ) : (
          <form action={formAction} className="px-6 py-5">
            {state.error && (
              <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm mb-4" style={{ background: "var(--danger-tint)", color: "var(--danger)" }}>
                {state.error}
              </div>
            )}

            <div className="flex flex-col gap-4">
              <div>
                <label htmlFor="new-email" className="field-label">Email address</label>
                <input ref={firstFieldRef} id="new-email" name="email" type="email" required className="field-input" autoComplete="off" placeholder="name@agefine.co.ke" />
              </div>

              <div>
                <label htmlFor="new-role" className="field-label">Role</label>
                <select id="new-role" name="role" defaultValue="manager" className="field-select">
                  <option value="manager">Management — catalogue, orders &amp; bookings</option>
                  <option value="super_admin">Super-admin — full access</option>
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-start gap-2.5 rounded-lg px-3.5 py-3" style={{ background: "var(--cream)" }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="var(--gold-text)" strokeWidth="1.7" aria-hidden="true" className="flex-none mt-0.5">
                <path d="M4 4h16v16H4zM4 7l8 6 8-6" />
              </svg>
              <p className="font-sans text-xs text-plum-soft leading-snug">
                We&rsquo;ll email them a secure link to set their own password — no temporary password to pass around.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button type="button" onClick={onClose} className="font-sans text-sm text-plum-soft hover:text-plum transition-colors px-2">
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={pending} aria-busy={pending}>
                {pending ? <><span className="btn-spinner" aria-hidden="true" />Sending…</> : "Send invite"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function SuccessPanel({ state, onClose }: { state: AdminActionState; onClose: () => void }) {
  return (
    <div className="px-6 py-6">
      <div className="flex flex-col items-center text-center gap-3 py-2">
        <span className="grid place-items-center w-12 h-12 rounded-full" style={{ background: "var(--ok-tint)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ok)" strokeWidth="2" aria-hidden="true">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        </span>
        <p className="font-sans text-sm text-plum leading-relaxed">
          Invitation sent to <span className="font-medium">{state.email}</span>.
          <br />
          <span className="text-plum-soft">They&rsquo;ll get an email to set their password and sign in.</span>
        </p>
      </div>
      <div className="mt-6 flex justify-end">
        <button type="button" onClick={onClose} className="btn btn-primary">Done</button>
      </div>
    </div>
  );
}
