import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import ProductRow from "@/components/admin/ProductRow";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = { title: "Products — Agefine Admin" };

export default async function AdminProductsPage() {
  const user = await requireAdmin();
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  const categoryName = new Map((categories ?? []).map((c) => [c.id, c.name]));

  return (
    <AdminShell
      title="Products"
      adminEmail={user.email}
      actions={<Link href="/admin/products/new" className="btn btn-primary">Add product</Link>}
    >
      {!products || products.length === 0 ? (
        <div className="surface-card p-10 text-center">
          <p className="font-serif italic text-plum text-2xl mb-2">No products yet.</p>
          <p className="font-sans font-light text-plum-soft text-sm mb-6">Add your first product to the catalogue.</p>
          <Link href="/admin/products/new" className="btn btn-primary">Add product</Link>
        </div>
      ) : (
        <div className="surface-card overflow-hidden">
          {/* Header row (desktop) */}
          <div className="hidden md:grid grid-cols-[1fr_140px_90px_120px_120px] gap-4 px-5 py-3 border-b font-sans text-[11px] tracking-[0.1em] uppercase text-plum-soft" style={{ borderColor: "var(--line)" }}>
            <span>Product</span>
            <span>Category</span>
            <span>Price</span>
            <span>Status</span>
            <span className="text-right">Actions</span>
          </div>
          <ul className="list-none m-0 p-0">
            {products.map((p) => (
              <ProductRow
                key={p.id}
                product={p}
                categoryName={p.category_id ? categoryName.get(p.category_id) ?? null : null}
              />
            ))}
          </ul>
        </div>
      )}
    </AdminShell>
  );
}
