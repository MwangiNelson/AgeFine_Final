import Link from "next/link";
import AdminNav from "./AdminNav";
import type { AdminRole } from "@/lib/supabase/admin-guard";

/**
 * Admin chrome: a sidebar on desktop, a top bar on mobile. Used by each admin
 * page (not a layout) so the login page stays chrome-free. `title` labels the page.
 */
export default function AdminShell({
  title,
  adminEmail,
  role,
  actions,
  children,
}: {
  title: string;
  adminEmail?: string;
  role?: AdminRole | null;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen md:flex" style={{ background: "var(--ivory)" }}>
      {/* Sidebar / top bar */}
      <header
        className="md:w-64 md:flex md:flex-col md:fixed md:inset-y-0 border-b md:border-b-0 md:border-r"
        style={{ borderColor: "var(--line)", background: "#fff" }}
      >
        <div className="px-5 py-4 md:py-6 flex items-center justify-between md:block">
          <Link href="/admin" className="no-underline">
            <span className="block font-serif font-medium text-xl tracking-[0.16em]"><span className="text-brand-blue">AGE</span><span className="text-brand-pink">FINE</span></span>
            <span className="block eyebrow mt-1">admin</span>
          </Link>
        </div>
        <AdminNav role={role} />
        <form action="/admin/signout" method="post" className="px-5 py-4 mt-auto border-t hidden md:block" style={{ borderColor: "var(--line)" }}>
          {adminEmail && (
            <p className="font-sans text-xs text-plum-soft mb-2 truncate" title={adminEmail}>
              {adminEmail}{role === "manager" && " · Management"}
            </p>
          )}
          <button type="submit" className="font-sans text-xs tracking-[0.1em] uppercase text-plum-soft hover:text-rose transition-colors">
            Sign out
          </button>
        </form>
      </header>

      {/* Main column */}
      <div className="flex-1 md:ml-64 min-w-0">
        <div className="mx-auto px-5 md:px-10 py-6 md:py-10 max-w-[1100px]">
          <div className="flex items-center justify-between gap-4 mb-6 md:mb-8">
            <h1 className="font-serif text-plum text-3xl md:text-4xl">{title}</h1>
            {actions && <div className="flex items-center gap-3">{actions}</div>}
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
