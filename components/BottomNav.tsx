"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    label: "Home",
    href: "/",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="21" height="21">
        <path d="M4 11l8-6 8 6v8a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1z" />
      </svg>
    ),
  },
  {
    label: "Shop",
    href: "/shop",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="21" height="21">
        <path d="M6 8h12l-1 12H7L6 8z" />
        <path d="M9 8a3 3 0 016 0" />
      </svg>
    ),
  },
  {
    label: "Services",
    href: "/services",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="21" height="21">
        <path d="M12 3l2.5 5 5.5.7-4 3.9 1 5.4L12 21l-5-2.6 1-5.4-4-3.9 5.5-.7z" />
      </svg>
    ),
  },
  {
    label: "Bag",
    href: "/cart",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="21" height="21">
        <path d="M6 8h12l-1 12H7L6 8z" />
        <path d="M9 8a3 3 0 016 0" />
      </svg>
    ),
  },
  {
    label: "You",
    href: "/account",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="21" height="21">
        <circle cx="12" cy="8" r="3.4" />
        <path d="M5 20a7 7 0 0114 0" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 40,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        background: "rgba(251,247,242,0.92)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        borderTop: "0.5px solid var(--line)",
        padding: "10px 8px 14px",
      }}
    >
      {tabs.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              color: active ? "var(--rose)" : "var(--plum-soft)",
              fontSize: 8.5,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              textDecoration: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "var(--sans)",
            }}
          >
            {tab.icon}
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
