import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ServiceRow from "@/components/admin/ServiceRow";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Services — Agefine Admin" };

export default async function AdminServicesPage() {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <AdminShell
      title="Services"
      adminEmail={user.email}
      actions={<Link href="/admin/services/new" className="btn btn-primary">Add service</Link>}
    >
      {!services || services.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl mb-2">No services yet.</p>
          <p className="font-sans font-light text-plum-soft text-sm mb-6">Add your first treatment to the menu.</p>
          <Link href="/admin/services/new" className="btn btn-primary">Add service</Link>
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          {/* Header row (desktop) */}
          <div className="hidden md:grid grid-cols-[1fr_150px_90px_110px_110px_120px] gap-4 px-5 py-3 border-b font-sans text-[11px] tracking-[0.1em] uppercase text-plum-soft" style={{ borderColor: "var(--line)" }}>
            <span>Service</span>
            <span>Category</span>
            <span>Duration</span>
            <span>Carousel</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="list-none m-0 p-0">
            {services.map((s) => (
              <ServiceRow key={s.id} service={s} />
            ))}
          </ul>
        </div>
      )}
    </AdminShell>
  );
}
