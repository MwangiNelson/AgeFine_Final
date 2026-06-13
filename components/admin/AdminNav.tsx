"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { label: "Overview", href: "/admin" },
  { label: "Services", href: "/admin/services" },
  { label: "Products", href: "/admin/products" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Applications", href: "/admin/applications" },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Admin" className="px-3 md:px-3 md:mt-2 flex md:flex-col gap-1 overflow-x-auto">
      {LINKS.map((link) => {
        const active = link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className="font-sans text-sm px-4 py-2.5 rounded-lg no-underline whitespace-nowrap transition-colors"
            style={{
              background: active ? "var(--cream)" : "transparent",
              color: active ? "var(--plum)" : "var(--plum-soft)",
              fontWeight: active ? 500 : 400,
            }}
          >
            {link.label}
          </Link>
        );
      })}
      {/* Mobile sign-out (sidebar form is desktop-only) */}
      <form action="/admin/signout" method="post" className="md:hidden ml-auto">
        <button type="submit" className="font-sans text-sm px-4 py-2.5 text-plum-soft hover:text-rose transition-colors whitespace-nowrap">
          Sign out
        </button>
      </form>
    </nav>
  );
}
