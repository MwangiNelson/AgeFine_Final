"use client";

import { useState, useTransition } from "react";
import type { Database } from "@/lib/database.types";
import {
  nextBookingStatuses,
  BOOKING_STATUS_LABELS,
  type BookingStatus,
} from "@/lib/admin";
import { updateBookingStatus } from "@/app/admin/bookings/actions";
import { formatSlot } from "@/lib/booking";

type Booking = Database["public"]["Tables"]["bookings"]["Row"];

const STATUS_COLORS: Record<BookingStatus, { bg: string; fg: string }> = {
  new: { bg: "#FBF0E2", fg: "#8a5a12" },
  contacted: { bg: "#EDE7F2", fg: "#5a3f7b" },
  confirmed: { bg: "#E8F0E6", fg: "#3f6b3a" },
  completed: { bg: "#E6ECF2", fg: "#3a5a7b" },
  cancelled: { bg: "#F3E6E6", fg: "#9b2c2c" },
};

/* Intent of each move, so the button reads its meaning at a glance:
   green advances the booking, red cancels it, plum is a lateral touchpoint. */
const TONE_CLASS: Record<BookingStatus, string> = {
  new: "act-neutral",
  contacted: "act-neutral",
  confirmed: "act-ok-soft",
  completed: "act-ok-soft",
  cancelled: "act-danger-soft",
};

const Spinner = () => <span className="act-spinner" aria-hidden="true" />;

export default function BookingCard({ booking }: { booking: Booking }) {
  const [pending, startTransition] = useTransition();
  const [busyTo, setBusyTo] = useState<BookingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const status = booking.status as BookingStatus;
  const transitions = nextBookingStatuses(status);
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.new;
  const created = new Date(booking.created_at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });

  function move(to: BookingStatus) {
    setError(null);
    setBusyTo(to);
    startTransition(async () => {
      const res = await updateBookingStatus(booking.id, status, to);
      if (!res.ok) setError(res.error ?? "Update failed.");
      setBusyTo(null);
    });
  }

  return (
    <li className="surface-card p-5 md:p-6 flex flex-col" aria-busy={pending}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-serif text-plum text-xl leading-tight">{booking.service}</h3>
          <p className="font-sans text-xs text-plum-soft mt-1">{created}</p>
        </div>
        <span className="font-sans text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: color.bg, color: color.fg }}>
          {BOOKING_STATUS_LABELS[status] ?? status}
        </span>
      </div>

      <div className="font-sans text-sm text-plum-soft flex flex-col gap-1 mb-3">
        <p className="text-plum">{booking.name}</p>
        <p><a href={`tel:${booking.phone}`} className="no-underline hover:text-plum transition-colors">{booking.phone}</a></p>
        {booking.preferred_date && (
          <p>
            Preferred: {new Date(booking.preferred_date).toLocaleDateString("en-KE", { dateStyle: "medium" })}
            {booking.preferred_time ? ` · ${formatSlot(booking.preferred_time)}` : ""}
          </p>
        )}
        {booking.message && <p className="italic mt-1">“{booking.message}”</p>}
      </div>

      {error && <p className="field-error mb-2" role="alert">{error}</p>}

      <div className="mt-auto pt-3 border-t" style={{ borderColor: "var(--line)" }}>
        {transitions.length > 0 ? (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-sans text-xs text-plum-soft mr-1">Mark as:</span>
            {transitions.map((to) => {
              const busy = busyTo === to;
              return (
                <button
                  key={to}
                  type="button"
                  onClick={() => move(to)}
                  disabled={pending}
                  aria-busy={busy}
                  className={`act act-sm ${TONE_CLASS[to] ?? "act-neutral"}`}
                >
                  {busy && <Spinner />}
                  {BOOKING_STATUS_LABELS[to]}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="font-sans text-xs text-plum-soft">
            This booking is {BOOKING_STATUS_LABELS[status].toLowerCase()} — no further changes.
          </p>
        )}
      </div>
    </li>
  );
}
