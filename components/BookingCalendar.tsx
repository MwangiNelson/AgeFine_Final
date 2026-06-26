"use client";

import { useMemo, useState } from "react";
import {
  monthGrid,
  monthLabel,
  isSelectableDay,
  canNavigate,
  timeSlots,
  toISODate,
  formatSlot,
} from "@/lib/booking";
import { SITE } from "@/lib/site";

interface Props {
  /** Selected date as YYYY-MM-DD ("" = none). */
  date: string;
  /** Selected slot as HH:MM ("" = none). */
  time: string;
  onSelectDate: (iso: string) => void;
  onSelectTime: (hhmm: string) => void;
  /** Field-level error to announce (from form validation). */
  error?: string;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

/**
 * In-app booking calendar: pick a day (Mon–Sat, up to 60 days ahead),
 * then an hourly slot within opening hours. Fully keyboard operable —
 * every day/slot is a real button.
 */
export default function BookingCalendar({ date, time, onSelectDate, onSelectTime, error }: Props) {
  const today = useMemo(() => new Date(), []);
  const [view, setView] = useState(() => ({ year: today.getFullYear(), month: today.getMonth() }));

  const weeks = useMemo(() => monthGrid(view.year, view.month), [view]);
  const slots = useMemo(() => {
    const hours = SITE.openingHours[0];
    return timeSlots(hours.opens, hours.closes);
  }, []);

  function navigate(delta: 1 | -1) {
    setView((v) => {
      if (!canNavigate(v.year, v.month, delta, today)) return v;
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  const prevDisabled = !canNavigate(view.year, view.month, -1, today);
  const nextDisabled = !canNavigate(view.year, view.month, 1, today);

  return (
    <fieldset className="border-0 p-0 m-0">
      <legend className="field-label">Preferred date &amp; time (optional)</legend>

      <div className="rounded-lg border p-4" style={{ borderColor: "var(--line)", background: "#fff" }}>
        {/* Month header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={prevDisabled}
            aria-label="Previous month"
            className="flex items-center justify-center w-9 h-9 rounded-full text-plum disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <p className="font-serif text-plum text-lg m-0" aria-live="polite">{monthLabel(view.year, view.month)}</p>
          <button
            type="button"
            onClick={() => navigate(1)}
            disabled={nextDisabled}
            aria-label="Next month"
            className="flex items-center justify-center w-9 h-9 rounded-full text-plum disabled:opacity-30"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 mb-1" aria-hidden="true">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-center font-sans text-[10px] tracking-[0.1em] uppercase text-plum-soft py-1">
              {d}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div role="group" aria-label="Choose a day">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7">
              {week.map((day, di) => {
                if (!day) return <span key={di} aria-hidden="true" />;
                const iso = toISODate(day);
                const selectable = isSelectableDay(day, today);
                const selected = iso === date;
                return (
                  <button
                    key={di}
                    type="button"
                    disabled={!selectable}
                    aria-pressed={selected}
                    aria-label={day.toLocaleDateString("en-KE", { weekday: "long", day: "numeric", month: "long" })}
                    onClick={() => onSelectDate(selected ? "" : iso)}
                    className="aspect-square min-h-[40px] m-0.5 rounded-full font-sans text-[13px] transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                    style={{
                      background: selected ? "var(--brand-blue)" : "transparent",
                      color: selected ? "#fff" : "var(--plum)",
                      border: selected ? "1px solid var(--brand-blue)" : "1px solid transparent",
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Time slots — revealed once a day is chosen */}
        {date && (
          <div className="mt-4 pt-4 border-t" style={{ borderColor: "var(--line)" }}>
            <p className="field-label" id="slot-label">Available times</p>
            <div role="group" aria-labelledby="slot-label" className="flex flex-wrap gap-2">
              {slots.map((slot) => {
                const selected = slot === time;
                return (
                  <button
                    key={slot}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => onSelectTime(selected ? "" : slot)}
                    className="font-sans text-[12.5px] tracking-[0.04em] px-3.5 min-h-[40px] rounded-full transition-colors"
                    style={{
                      background: selected ? "var(--brand-blue)" : "var(--sand)",
                      color: selected ? "#fff" : "var(--plum)",
                      border: "1px solid " + (selected ? "var(--brand-blue)" : "var(--line)"),
                    }}
                  >
                    {formatSlot(slot)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <p className="font-sans text-[11.5px] text-plum-soft mt-3 mb-0">
          {SITE.openingHoursHuman} · We confirm every booking by phone or WhatsApp.
        </p>
      </div>

      {error && <p className="field-error" role="alert">{error}</p>}
    </fieldset>
  );
}
