"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function Header() {
  const { count } = useCart();
  const [stuck, setStuck] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => {
      setStuck(window.scrollY > 10);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      ref={headerRef}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 30,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 20px",
        background: "rgba(251,247,242,0.86)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: stuck
          ? "0.5px solid var(--line)"
          : "0.5px solid transparent",
        boxShadow: stuck ? "0 6px 20px rgba(40,24,34,0.05)" : "none",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Menu button */}
      <button
        aria-label="Menu"
        style={{
          width: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--plum)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {/* Wordmark */}
      <Link href="/" style={{ textAlign: "center", lineHeight: 1, textDecoration: "none" }}>
        <div
          style={{
            fontFamily: "var(--serif)",
            fontWeight: 500,
            fontSize: 22,
            letterSpacing: "0.16em",
            color: "var(--plum)",
          }}
        >
          AGEFINE
        </div>
        <div
          style={{
            fontSize: 8.5,
            letterSpacing: "0.34em",
            textTransform: "uppercase",
            color: "var(--rose)",
            marginTop: 3,
            fontFamily: "var(--sans)",
          }}
        >
          cosmetics &amp; skin clinic
        </div>
      </Link>

      {/* Cart button */}
      <Link
        href="/cart"
        aria-label="Bag"
        style={{
          width: 38,
          height: 38,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--plum)",
          position: "relative",
          textDecoration: "none",
        }}
      >
        <svg
          width="21"
          height="21"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        >
          <path d="M6 8h12l-1 12H7L6 8z" />
          <path d="M9 8a3 3 0 016 0" />
        </svg>
        <span
          id="cartdot"
          style={{
            position: "absolute",
            top: 5,
            right: 4,
            minWidth: 15,
            height: 15,
            padding: "0 3px",
            borderRadius: 9,
            background: "var(--rose)",
            color: "#fff",
            fontSize: 9,
            fontWeight: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "transform 0.18s",
          }}
        >
          {count}
        </span>
      </Link>
    </header>
  );
}
