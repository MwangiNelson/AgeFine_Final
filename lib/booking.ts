/* ============================================================
   Booking calendar domain logic — pure, fully unit-testable.

   The clinic takes bookings Mon–Sat, 9am–6pm (see SITE.openingHours).
   The calendar offers dates from today up to BOOKING_WINDOW_DAYS
   ahead, and hourly slots within opening hours.
   ============================================================ */

export const BOOKING_WINDOW_DAYS = 60;

/** Day of week the clinic is closed (0 = Sunday). */
const CLOSED_DAYS: number[] = [0];

/** "HH:MM" → minutes since midnight. */
function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Minutes since midnight → "HH:MM". */
function toHHMM(mins: number): string {
  const h = String(Math.floor(mins / 60)).padStart(2, "0");
  const m = String(mins % 60).padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Hourly appointment slots within opening hours. The last slot starts one
 * step before closing (a 9–6 day yields 09:00 … 17:00).
 */
export function timeSlots(opens = "09:00", closes = "18:00", stepMin = 60): string[] {
  const out: string[] = [];
  for (let t = toMinutes(opens); t < toMinutes(closes); t += stepMin) {
    out.push(toHHMM(t));
  }
  return out;
}

/** Local-timezone YYYY-MM-DD (Date#toISOString would shift the day in UTC+3). */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Strip the time component (local midnight). */
export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

/**
 * Can this day be booked? Not a closed day, not in the past, and within
 * the booking window.
 */
export function isSelectableDay(day: Date, today: Date, windowDays = BOOKING_WINDOW_DAYS): boolean {
  const d = startOfDay(day);
  const t = startOfDay(today);
  if (CLOSED_DAYS.includes(d.getDay())) return false;
  if (d < t) return false;
  const max = new Date(t);
  max.setDate(max.getDate() + windowDays);
  return d <= max;
}

/**
 * The weeks of a month as a Monday-first grid. Cells outside the month
 * are null so the UI can render empty placeholders.
 */
export function monthGrid(year: number, month: number): (Date | null)[][] {
  const first = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  // Monday-first column index (JS getDay: 0 = Sunday).
  const lead = (first.getDay() + 6) % 7;

  const cells: (Date | null)[] = Array.from({ length: lead }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (Date | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/** Clamp month navigation to [current month … current month + window]. */
export function canNavigate(
  year: number,
  month: number,
  delta: 1 | -1,
  today: Date,
  windowDays = BOOKING_WINDOW_DAYS,
): boolean {
  const target = new Date(year, month + delta, 1);
  const t = startOfDay(today);
  const min = new Date(t.getFullYear(), t.getMonth(), 1);
  const maxDay = new Date(t);
  maxDay.setDate(maxDay.getDate() + windowDays);
  const max = new Date(maxDay.getFullYear(), maxDay.getMonth(), 1);
  return target >= min && target <= max;
}

/** "14:00" → "2:00 PM" for friendly display. */
export function formatSlot(hhmm: string): string {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}
