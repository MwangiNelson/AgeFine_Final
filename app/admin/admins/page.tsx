import AdminShell from "@/components/admin/AdminShell";
import { AdminAccountsProvider, AddMemberButton, AdminAccountsTable } from "@/components/admin/AdminAccounts";
import { requireSuperAdmin, getRole } from "@/lib/supabase/admin-guard";
import { listAdminUsers } from "./actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Team — Agefine Admin" };

export default async function AdminsPage() {
  const user = await requireSuperAdmin();
  const users = await listAdminUsers();

  return (
    <AdminAccountsProvider>
      <AdminShell title="Team" adminEmail={user.email} role={getRole(user)} actions={<AddMemberButton />}>
        <p className="font-sans font-light text-plum-soft text-sm mb-6 max-w-[560px]">
          Everyone with access to this dashboard. New members get a sign-in link and a strong password by email.
        </p>
        <AdminAccountsTable users={users} currentUserId={user.id} />
      </AdminShell>
    </AdminAccountsProvider>
  );
}
