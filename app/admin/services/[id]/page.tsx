import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ServiceForm from "@/components/admin/ServiceForm";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { updateService } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit service — Agefine Admin" };

export default async function EditServicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: service } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  if (!service) notFound();

  // Bind the service id into the update action.
  const action = updateService.bind(null, service.id);

  return (
    <AdminShell title="Edit service" adminEmail={user.email} role={getRole(user)}>
      <ServiceForm action={action} service={service} />
    </AdminShell>
  );
}
