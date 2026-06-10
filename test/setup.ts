import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

// Public env used by checkout's confirmation screen (Till + WhatsApp link).
process.env.NEXT_PUBLIC_WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP || "254712345678";
process.env.NEXT_PUBLIC_TILL_NUMBER = process.env.NEXT_PUBLIC_TILL_NUMBER || "555888";

class IO {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}
// @ts-expect-error jsdom lacks IntersectionObserver
global.IntersectionObserver = IO;

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (q: string) => ({
    matches: false, media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, dispatchEvent: () => false,
  }),
});
