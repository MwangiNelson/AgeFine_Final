import AdminShell from "@/components/admin/AdminShell";
import ServiceForm from "@/components/admin/ServiceForm";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createService } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "New service — Agefine Admin" };

export default async function NewServicePage() {
  const user = await requireAdmin();

  return (
    <AdminShell title="New service" adminEmail={user.email} role={getRole(user)}>
      <ServiceForm action={createService} />
    </AdminShell>
  );
}
