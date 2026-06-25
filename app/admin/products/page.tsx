import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductsBoard from "@/components/admin/ProductsBoard";
import { requireAdmin, getRole } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products — Agefine Admin" };

export default async function AdminProductsPage() {
  const user = await requireAdmin();
  const role = getRole(user);
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("sort_order", { ascending: true }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const categoryNames = Object.fromEntries((categories ?? []).map((c) => [c.id, c.name]));

  return (
    <AdminShell
      title="Products"
      adminEmail={user.email}
      role={role}
      actions={<Link href="/admin/products/new" className="btn btn-primary">Add product</Link>}
    >
      {!products || products.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl mb-2">No products yet.</p>
          <p className="font-sans font-light text-plum-soft text-sm mb-6">Add your first product to the catalogue.</p>
          <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
        </div>
      ) : (
        <ProductsBoard products={products} categoryNames={categoryNames} isSuper={role === "super_admin"} />
      )}
    </AdminShell>
  );
}
