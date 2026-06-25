import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ServicesBoard from "@/components/admin/ServicesBoard";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Services — Agefine Admin" };

export default async function AdminServicesPage() {
  const user = await requireAdmin();
  const role = getRole(user);
  const supabase = await createClient();

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <AdminShell
      title="Services"
      adminEmail={user.email}
      role={role}
      actions={<Link href="/admin/services/new" className="btn btn-primary">Add service</Link>}
    >
      {!services || services.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl mb-2">No services yet.</p>
          <p className="font-sans font-light text-plum-soft text-sm mb-6">Add your first treatment to the menu.</p>
          <Link href="/admin/services/new" className="btn btn-primary">Add service</Link>
        </div>
      ) : (
        <ServicesBoard services={services} isSuper={role === "super_admin"} />
      )}
    </AdminShell>
  );
}
