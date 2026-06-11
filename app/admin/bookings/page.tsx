import AdminShell from "@/components/admin/AdminShell";
import BookingCard from "@/components/admin/BookingCard";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = { title: "Bookings — Agefine Admin" };

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await requireAdmin();
  const supabase = await createClient();

  const filter = BOOKING_STATUSES.includes(status as BookingStatus) ? (status as BookingStatus) : null;

  let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
  if (filter) query = query.eq("status", filter);
  const { data: bookings } = await query;

  const tabs = [{ id: "", label: "All" }, ...BOOKING_STATUSES.map((s) => ({ id: s, label: s }))];

  return (
    <AdminShell title="Bookings" adminEmail={user.email}>
      <nav aria-label="Filter bookings" className="flex gap-2 overflow-x-auto mb-6">
        {tabs.map((t) => {
          const active = (filter ?? "") === t.id;
          return (
            <a
              key={t.id || "all"}
              href={t.id ? `/admin/bookings?status=${t.id}` : "/admin/bookings"}
              aria-current={active ? "page" : undefined}
              className="whitespace-nowrap font-sans text-xs tracking-[0.08em] uppercase px-4 py-2 rounded-full border no-underline transition-colors capitalize"
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

      {!bookings || bookings.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl">No bookings{filter ? ` with status "${filter}"` : " yet"}.</p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {bookings.map((b) => (
            <BookingCard key={b.id} booking={b} />
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
