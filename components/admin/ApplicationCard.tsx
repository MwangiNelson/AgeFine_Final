"use client";

import { useState, useTransition } from "react";
import type { ApplicationRow } from "@/lib/supabaseClient";
import {
  nextApplicationStatuses,
  APPLICATION_STATUS_LABELS,
  type ApplicationStatus,
} from "@/lib/admin";
import { INTEREST_LABELS, type ApplicationInterest } from "@/lib/careers";
import { updateApplicationStatus } from "@/app/admin/applications/actions";

const STATUS_COLORS: Record<ApplicationStatus, { bg: string; fg: string }> = {
  new: { bg: "#FBF0E2", fg: "#8a5a12" },
  reviewed: { bg: "#EDE7F2", fg: "#5a3f7b" },
  contacted: { bg: "#E8F0E6", fg: "#3f6b3a" },
  closed: { bg: "#E6ECF2", fg: "#3a5a7b" },
};

export default function ApplicationCard({ application }: { application: ApplicationRow }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const status = application.status as ApplicationStatus;
  const transitions = nextApplicationStatuses(status);
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.new;
  const created = new Date(application.created_at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
  const interestLabel = INTEREST_LABELS[application.interest as ApplicationInterest] ?? application.interest;

  function move(to: ApplicationStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateApplicationStatus(application.id, status, to);
      if (!res.ok) setError(res.error ?? "Update failed.");
    });
  }

  return (
    <li className="surface-card p-5 md:p-6 flex flex-col" style={{ opacity: pending ? 0.6 : 1 }}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-serif text-plum text-xl leading-tight">{interestLabel}</h3>
          <p className="font-sans text-xs text-plum-soft mt-1">{created}</p>
        </div>
        <span className="font-sans text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: color.bg, color: color.fg }}>
          {APPLICATION_STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="font-sans text-sm text-plum-soft flex flex-col gap-1 mb-3">
        <p className="text-plum">{application.name}</p>
        <p><a href={`tel:${application.phone}`} className="no-underline hover:text-plum transition-colors">{application.phone}</a></p>
        {application.email && (
          <p><a href={`mailto:${application.email}`} className="no-underline hover:text-plum transition-colors">{application.email}</a></p>
        )}
        {application.message && <p className="italic mt-1">“{application.message}”</p>}
      </div>

      {error && <p className="field-error mb-2" role="alert">{error}</p>}

      <div className="mt-auto pt-3 border-t" style={{ borderColor: "var(--line)" }}>
        {transitions.length > 0 ? (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-sans text-xs text-plum-soft mr-1">Mark as:</span>
            {transitions.map((to) => (
              <button
                key={to}
                type="button"
                onClick={() => move(to)}
                disabled={pending}
                className="font-sans text-xs px-3.5 py-2 rounded-full border transition-colors"
                style={{
                  borderColor: to === "closed" ? "#d8b4b4" : "var(--plum)",
                  color: to === "closed" ? "#9b2c2c" : "var(--plum)",
                }}
              >
                {APPLICATION_STATUS_LABELS[to]}
              </button>
            ))}
          </div>
        ) : (
          <p className="font-sans text-xs text-plum-soft">
            This application is {APPLICATION_STATUS_LABELS[status].toLowerCase()} — no further changes.
          </p>
        )}
      </div>
    </li>
  );
}
