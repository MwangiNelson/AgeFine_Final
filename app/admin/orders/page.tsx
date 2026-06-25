import AdminShell from "@/components/admin/AdminShell";
import OrderCard from "@/components/admin/OrderCard";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/admin";
import type { OrderStatusHistory, OrderPayment } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — Agefine Admin" };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await requireAdmin();
  const role = getRole(user);
  const supabase = await createClient();

  const filter = ORDER_STATUSES.includes(status as OrderStatus) ? (status as OrderStatus) : null;

  const { data: allOrders } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
  const orders = allOrders ?? [];
  const shown = filter ? orders.filter((o) => o.status === filter) : orders;

  // Stats across all orders.
  const settledRevenue = orders
    .filter((o) => o.status === "paid" || o.status === "fulfilled")
    .reduce((sum, o) => sum + o.total_kes, 0);
  const stats = [
    { label: "Total", value: String(orders.length) },
    { label: "Awaiting payment", value: String(orders.filter((o) => o.status === "pending_payment").length) },
    { label: "To fulfil", value: String(orders.filter((o) => o.status === "paid").length) },
    { label: "Settled revenue", value: `KES ${settledRevenue.toLocaleString()}` },
  ];

  // Batch-load history + payments for the shown orders.
  const ids = shown.map((o) => o.id);
  const [{ data: history }, { data: payments }] = ids.length
    ? await Promise.all([
        supabase.from("order_status_history").select("*").in("order_id", ids).order("created_at", { ascending: true }),
        supabase.from("order_payments").select("*").in("order_id", ids).order("created_at", { ascending: true }),
      ])
    : [{ data: [] as OrderStatusHistory[] }, { data: [] as OrderPayment[] }];

  const historyBy = new Map<string, OrderStatusHistory[]>();
  for (const h of history ?? []) (historyBy.get(h.order_id) ?? historyBy.set(h.order_id, []).get(h.order_id)!).push(h);
  const paymentsBy = new Map<string, OrderPayment[]>();
  for (const p of payments ?? []) (paymentsBy.get(p.order_id) ?? paymentsBy.set(p.order_id, []).get(p.order_id)!).push(p);

  const tabs = [{ id: "", label: "All" }, ...ORDER_STATUSES.map((s) => ({ id: s, label: s.replace("_", " ") }))];

  return (
    <AdminShell title="Orders" adminEmail={user.email} role={role}>
      {/* Stats banner */}
      <div className="surface-card px-5 py-4 flex flex-wrap items-center gap-6 md:gap-10 mb-6">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-serif text-plum text-xl md:text-2xl leading-none">{s.value}</p>
            <p className="font-sans text-[11px] tracking-[0.1em] uppercase text-plum-soft mt-1">{s.label}</p>
          </div>
        ))}
      </div>

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

      {shown.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl">No orders{filter ? ` with status "${filter.replace("_", " ")}"` : " yet"}.</p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0 flex flex-col gap-3">
          {shown.map((o) => (
            <OrderCard
              key={o.id}
              order={o}
              history={historyBy.get(o.id) ?? []}
              payments={paymentsBy.get(o.id) ?? []}
              isSuper={role === "super_admin"}
            />
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
