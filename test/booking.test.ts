import { describe, it, expect } from "vitest";
import {
  timeSlots,
  toISODate,
  startOfDay,
  isSelectableDay,
  monthGrid,
  monthLabel,
  canNavigate,
  formatSlot,
  BOOKING_WINDOW_DAYS,
} from "@/lib/booking";

// A fixed "today" — Friday 12 June 2026.
const TODAY = new Date(2026, 5, 12, 14, 30);

describe("timeSlots", () => {
  it("yields hourly slots within opening hours, last slot before closing", () => {
    const slots = timeSlots("09:00", "18:00");
    expect(slots[0]).toBe("09:00");
    expect(slots[slots.length - 1]).toBe("17:00");
    expect(slots).toHaveLength(9);
  });

  it("supports a custom step", () => {
    expect(timeSlots("09:00", "11:00", 30)).toEqual(["09:00", "09:30", "10:00", "10:30"]);
  });
});

describe("toISODate", () => {
  it("formats in local time (no UTC day shift)", () => {
    expect(toISODate(new Date(2026, 0, 5, 0, 30))).toBe("2026-01-05");
    expect(toISODate(new Date(2026, 11, 31, 23, 59))).toBe("2026-12-31");
  });
});

describe("isSelectableDay", () => {
  it("rejects past days and accepts today", () => {
    expect(isSelectableDay(new Date(2026, 5, 11), TODAY)).toBe(false);
    expect(isSelectableDay(new Date(2026, 5, 12), TODAY)).toBe(true);
  });

  it("rejects Sundays (clinic closed)", () => {
    // 14 June 2026 is a Sunday.
    expect(new Date(2026, 5, 14).getDay()).toBe(0);
    expect(isSelectableDay(new Date(2026, 5, 14), TODAY)).toBe(false);
    // Saturday 13 June is bookable.
    expect(isSelectableDay(new Date(2026, 5, 13), TODAY)).toBe(true);
  });

  it("rejects days beyond the booking window", () => {
    const beyond = new Date(TODAY);
    beyond.setDate(beyond.getDate() + BOOKING_WINDOW_DAYS + 2);
    expect(isSelectableDay(beyond, TODAY)).toBe(false);
  });

  it("ignores the time-of-day component", () => {
    expect(isSelectableDay(new Date(2026, 5, 12, 0, 0), new Date(2026, 5, 12, 23, 59))).toBe(true);
  });
});

describe("monthGrid", () => {
  it("lays out June 2026 Monday-first", () => {
    const weeks = monthGrid(2026, 5);
    // 1 June 2026 is a Monday — no leading nulls.
    expect(weeks[0][0]?.getDate()).toBe(1);
    // 30 days: last week padded with nulls to 7 columns.
    const cells = weeks.flat();
    expect(cells.filter(Boolean)).toHaveLength(30);
    expect(cells.length % 7).toBe(0);
  });

  it("pads leading days for a mid-week month start", () => {
    // 1 May 2026 is a Friday → 4 leading nulls (Mon–Thu).
    const weeks = monthGrid(2026, 4);
    expect(weeks[0].slice(0, 4)).toEqual([null, null, null, null]);
    expect(weeks[0][4]?.getDate()).toBe(1);
  });
});

describe("month navigation", () => {
  it("cannot navigate before the current month", () => {
    expect(canNavigate(2026, 5, -1, TODAY)).toBe(false);
  });

  it("can navigate forward within the booking window", () => {
    expect(canNavigate(2026, 5, 1, TODAY)).toBe(true);
  });

  it("cannot navigate past the window", () => {
    // Window ends ~11 Aug 2026; from August, September is out of range.
    expect(canNavigate(2026, 7, 1, TODAY)).toBe(false);
  });

  it("labels months for humans", () => {
    expect(monthLabel(2026, 5)).toBe("June 2026");
  });
});

describe("formatSlot", () => {
  it("renders 12-hour labels", () => {
    expect(formatSlot("09:00")).toBe("9:00 AM");
    expect(formatSlot("12:00")).toBe("12:00 PM");
    expect(formatSlot("17:00")).toBe("5:00 PM");
  });
});

describe("startOfDay", () => {
  it("zeroes the time", () => {
    const d = startOfDay(new Date(2026, 5, 12, 18, 45));
    expect([d.getHours(), d.getMinutes()]).toEqual([0, 0]);
  });
});
