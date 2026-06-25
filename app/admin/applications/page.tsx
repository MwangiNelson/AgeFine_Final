import AdminShell from "@/components/admin/AdminShell";
import ApplicationCard from "@/components/admin/ApplicationCard";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { APPLICATION_STATUSES, type ApplicationStatus } from "@/lib/admin";

export const dynamic = "force-dynamic";

export const metadata = { title: "Applications — Agefine Admin" };

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const user = await requireAdmin();
  const supabase = await createClient();

  const filter = APPLICATION_STATUSES.includes(status as ApplicationStatus) ? (status as ApplicationStatus) : null;

  let query = supabase.from("applications").select("*").order("created_at", { ascending: false });
  if (filter) query = query.eq("status", filter);
  const { data: applications } = await query;

  const tabs = [{ id: "", label: "All" }, ...APPLICATION_STATUSES.map((s) => ({ id: s, label: s }))];

  return (
    <AdminShell title="Applications" adminEmail={user.email} role={getRole(user)}>
      <nav aria-label="Filter applications" className="flex gap-2 overflow-x-auto mb-6">
        {tabs.map((t) => {
          const active = (filter ?? "") === t.id;
          return (
            <a
              key={t.id || "all"}
              href={t.id ? `/admin/applications?status=${t.id}` : "/admin/applications"}
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

      {!applications || applications.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl">No applications{filter ? ` with status "${filter}"` : " yet"}.</p>
        </div>
      ) : (
        <ul className="list-none p-0 m-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {applications.map((a) => (
            <ApplicationCard key={a.id} application={a} />
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
