"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";

const tabs = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="22" height="22" aria-hidden="true">
        <path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1z" />
      </svg>
    ),
  },
  {
    label: "Shop",
    href: "/shop",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="22" height="22" aria-hidden="true">
        <path d="M6 8h12l-1 12H7L6 8z" />
        <path d="M9 8a3 3 0 016 0" />
      </svg>
    ),
  },
  {
    label: "Services",
    href: "/services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="22" height="22" aria-hidden="true">
        <path d="M12 3l2.5 5 5.5.7-4 3.9 1 5.4L12 21l-5-2.6 1-5.4-4-3.9 5.5-.7z" />
      </svg>
    ),
  },
  {
    label: "Bag",
    href: "/cart",
    withCount: true,
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="22" height="22" aria-hidden="true">
        <path d="M6 8h12l-1 12H7L6 8z" />
        <path d="M9 8a3 3 0 016 0" />
      </svg>
    ),
  },
  {
    label: "Contact",
    href: "/contact",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="22" height="22" aria-hidden="true">
        <path d="M4 5h16v14H4z" />
        <path d="M4 7l8 6 8-6" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <nav
      aria-label="Primary mobile"
      className="md:hidden fixed left-0 right-0 bottom-0 z-40 flex justify-around items-stretch"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "0.5px solid var(--line)",
        paddingBottom: "max(8px, env(safe-area-inset-bottom))",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className="relative flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] pt-2 no-underline font-sans text-[8.5px] tracking-[0.12em] uppercase"
            style={{ color: active ? "var(--brand-pink-deep)" : "var(--plum-soft)" }}
          >
            <span className="relative">
              {tab.icon}
              {tab.withCount && count > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-2 min-w-[15px] h-[15px] px-1 rounded-full bg-brand-pink text-white text-[8px] font-medium flex items-center justify-center"
                >
                  {count}
                </span>
              )}
            </span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
