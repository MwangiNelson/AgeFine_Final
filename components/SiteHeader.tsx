"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { whatsappLink } from "@/lib/site";

const NAV_LINKS = [
  { label: "Shop", href: "/shop" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/contact" },
];

function BagIcon() {
  return (
    <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M6 8h12l-1 12H7L6 8z" />
      <path d="M9 8a3 3 0 016 0" />
    </svg>
  );
}

export default function SiteHeader() {
  const { count } = useCart();
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Trap focus + Escape-to-close + restore focus when the drawer is open.
  useEffect(() => {
    if (!menuOpen) return;
    const triggerButton = menuButtonRef.current;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    // Move focus into the drawer.
    const firstLink = drawerRef.current?.querySelector<HTMLElement>("a, button");
    firstLink?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      triggerButton?.focus();
    };
  }, [menuOpen]);

  const cartBadge =
    count > 0 ? (
      <span
        aria-hidden="true"
        className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-pink text-white text-[10px] font-medium flex items-center justify-center"
      >
        {count}
      </span>
    ) : null;

  return (
    <header
      className="sticky top-0 z-30 transition-[border-color,box-shadow] duration-300"
      style={{
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: stuck ? "0.5px solid var(--line)" : "0.5px solid transparent",
        boxShadow: stuck ? "0 6px 20px rgba(40,24,34,0.05)" : "none",
      }}
    >
      <div className="mx-auto flex items-center justify-between gap-4 px-5 md:px-8 py-3.5 md:py-4" style={{ maxWidth: "var(--container)" }}>
        {/* Left: mobile menu button (hidden on desktop) */}
        <button
          ref={menuButtonRef}
          type="button"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
          className="md:hidden flex items-center justify-center w-11 h-11 -ml-2 text-plum"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        {/* Wordmark */}
        <Link
          href="/"
          className="text-center leading-none no-underline md:mr-auto md:text-left"
          aria-label="Agefine home"
        >
          <span className="block font-serif font-medium text-[22px] md:text-2xl tracking-[0.16em]">
            <span className="text-brand-blue">AGE</span><span className="text-brand-pink">FINE</span>
          </span>
          <span className="block font-sans text-[8.5px] md:text-[9px] tracking-[0.34em] uppercase text-brand-pink-deep mt-[3px]">
            beauty lab &amp; clinic
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className="relative font-sans text-[13px] tracking-[0.12em] uppercase no-underline pb-1 transition-colors"
                style={{ color: active ? "var(--plum)" : "var(--plum-soft)" }}
              >
                {link.label}
                <span
                  aria-hidden="true"
                  className="absolute left-0 -bottom-0.5 h-px bg-brand-blue transition-[width] duration-300"
                  style={{ width: active ? "100%" : 0 }}
                />
              </Link>
            );
          })}
        </nav>

        {/* Cart link */}
        <Link
          href="/cart"
          aria-label={count > 0 ? `Bag, ${count} item${count === 1 ? "" : "s"}` : "Bag"}
          className="relative flex items-center justify-center w-11 h-11 -mr-2 md:ml-4 text-plum no-underline"
        >
          <BagIcon />
          {cartBadge}
        </Link>
      </div>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="presentation">
          <button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-[rgba(43,27,36,0.45)] border-0 cursor-default"
          />
          <div
            ref={drawerRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="absolute left-0 top-0 h-full w-[82%] max-w-[320px] bg-ivory shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--line)" }}>
              <span className="font-serif font-medium text-xl tracking-[0.16em]"><span className="text-brand-blue">AGE</span><span className="text-brand-pink">FINE</span></span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center w-11 h-11 -mr-2 text-plum"
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <nav aria-label="Mobile" className="flex flex-col px-6 py-4">
              {[{ label: "Home", href: "/" }, ...NAV_LINKS].map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className="font-serif text-2xl py-3.5 no-underline border-b"
                    style={{ color: active ? "var(--brand-pink-deep)" : "var(--plum)", borderColor: "var(--line)" }}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-auto px-6 py-6">
              <a href={whatsappLink()} className="btn btn-gold w-full">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
