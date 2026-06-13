import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Admin — Agefine Cosmetics" };

export default async function AdminOverviewPage() {
  const user = await requireAdmin();
  const supabase = await createClient();

  const [services, products, pendingOrders, paidOrders, newBookings, newApplications] = await Promise.all([
    supabase.from("services").select("id", { count: "exact", head: true }).eq("active", true),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "pending_payment"),
    supabase.from("orders").select("id", { count: "exact", head: true }).eq("status", "paid"),
    supabase.from("bookings").select("id", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("applications").select("id", { count: "exact", head: true }).eq("status", "new"),
  ]);

  const stats = [
    { label: "Live services", value: services.count ?? 0, href: "/admin/services" },
    { label: "Products", value: products.count ?? 0, href: "/admin/products" },
    { label: "Orders awaiting payment", value: pendingOrders.count ?? 0, href: "/admin/orders" },
    { label: "Orders to fulfil", value: paidOrders.count ?? 0, href: "/admin/orders" },
    { label: "New bookings", value: newBookings.count ?? 0, href: "/admin/bookings" },
    { label: "New applications", value: newApplications.count ?? 0, href: "/admin/applications" },
  ];

  return (
    <AdminShell title="Overview" adminEmail={user.email}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="surface-card p-6 no-underline hover:shadow-[0_14px_34px_rgba(60,35,49,0.08)] transition-shadow">
            <p className="font-serif text-plum text-4xl md:text-5xl leading-none">{s.value}</p>
            <p className="font-sans text-plum-soft text-sm mt-3">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="surface-card p-6 md:p-8 mt-6 md:mt-8">
        <h2 className="font-serif text-plum text-2xl mb-2">Quick actions</h2>
        <p className="font-sans font-light text-plum-soft text-sm mb-5">Jump straight to the most common tasks.</p>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/services/new" className="btn btn-primary">Add a service</Link>
          <Link href="/admin/products/new" className="btn btn-outline">Add a product</Link>
          <Link href="/admin/orders" className="btn btn-outline">Manage orders</Link>
          <Link href="/admin/bookings" className="btn btn-outline">View bookings</Link>
          <Link href="/admin/applications" className="btn btn-outline">Review applications</Link>
        </div>
      </div>
    </AdminShell>
  );
}
