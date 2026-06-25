import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { createProduct } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "New product — Agefine Admin" };

export default async function NewProductPage() {
  const user = await requireAdmin();
  const supabase = await createClient();
  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <AdminShell title="New product" adminEmail={user.email} role={getRole(user)}>
      <ProductForm action={createProduct} categories={categories ?? []} />
    </AdminShell>
  );
}
