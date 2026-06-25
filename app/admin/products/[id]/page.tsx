import { notFound } from "next/navigation";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm from "@/components/admin/ProductForm";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";
import { updateProduct } from "../actions";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit product — Agefine Admin" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireAdmin();
  const supabase = await createClient();

  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("*").order("name"),
  ]);

  if (!product) notFound();

  // Bind the product id into the update action.
  const action = updateProduct.bind(null, product.id);

  return (
    <AdminShell title="Edit product" adminEmail={user.email} role={getRole(user)}>
      <ProductForm action={action} categories={categories ?? []} product={product} />
    </AdminShell>
  );
}
