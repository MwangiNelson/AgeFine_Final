import AdminShell from "@/components/admin/AdminShell";
import OrderCard from "@/components/admin/OrderCard";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — Agefine Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await requireAdmin();
  const supabase = await createClient();

  const filter = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : null;

  let query = supabase.from("orders").select("*").order("created_at", { ascending: false });
  if (filter) query = query.eq("status", filter);
  const { data: orders } = await query;

  const tabs = [{ id: "", label: "All" }, ...ORDER_STATUSES.map((s) => ({ id: s, label: s.replace("_", " ") }))];

  return (
    <AdminShell title="Orders" adminEmail={user.email}>
      {/* Status filter */}
      <nav aria-label="Filter orders" className="flex gap-2 overflow-x-auto mb-6">
        {tabs.map((t) => {
          const active = (filter ?? "") === t.id;
          return (
            <a
              key={t.id || "all"}
              href={t.id ? `/admin/orders?status=${t.id}` : "/admin/orders"}
              aria-current={active ? "page" : undefined}
              className="whitespace-nowrap font-sans text-xs tracking-[0.08em] uppercase px-4 py-2 rounded-full border no-underline transition-colors"
              style={{
                borderColor: active ? "var(--plum)" : "var(--line)",
                background: active ? "var(--plum)" : "transparent",
                color: active ? "var(--ivory)" : "var(--plum-soft)",
              }}
            >
              {t.label}
            </a>
          );
        })}
      </nav>

      {!orders || orders.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl">No orders{filter ? ` with status "${filter.replace("_", " ")}"` : " yet"}.</p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-4">
          {orders.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
