"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { buildProductPayload, validateProduct, isProductValid } from "@/lib/admin";

export interface ProductActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const BUCKET = "product-images";

/** Uploads any selected image files and returns their public URLs. */
async function uploadImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  files: File[]
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    if (!file || file.size === 0) continue;
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (error) throw new Error(`Image upload failed: ${error.message}`);
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    urls.push(data.publicUrl);
  }
  return urls;
}

function parseForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    description: String(formData.get("description") ?? ""),
    price_kes: String(formData.get("price_kes") ?? ""),
    category_id: (formData.get("category_id") as string) || null,
    stock: String(formData.get("stock") ?? ""),
    active: formData.get("active") === "on",
    existingImages: formData.getAll("existing_images").map(String).filter(Boolean),
    newImages: formData.getAll("images").filter((f): f is File => f instanceof File),
  };
}

export async function createProduct(
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requireAdmin();
  const supabase = await createClient();
  const input = parseForm(formData);

  const errors = validateProduct(input);
  if (!isProductValid(errors)) return { fieldErrors: errors };

  let imageUrls: string[];
  try {
    imageUrls = [...input.existingImages, ...(await uploadImages(supabase, input.newImages))];
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }

  const payload = buildProductPayload({ ...input, image_urls: imageUrls });
  const { error } = await supabase.from("products").insert(payload);
  if (error) {
    return { error: error.message.includes("duplicate") ? "A product with that slug already exists." : error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(
  id: string,
  _prev: ProductActionState,
  formData: FormData
): Promise<ProductActionState> {
  await requireAdmin();
  const supabase = await createClient();
  const input = parseForm(formData);

  const errors = validateProduct(input);
  if (!isProductValid(errors)) return { fieldErrors: errors };

  let imageUrls: string[];
  try {
    imageUrls = [...input.existingImages, ...(await uploadImages(supabase, input.newImages))];
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }

  const payload = buildProductPayload({ ...input, image_urls: imageUrls });
  const { error } = await supabase.from("products").update(payload).eq("id", id);
  if (error) {
    return { error: error.message.includes("duplicate") ? "A product with that slug already exists." : error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/shop/${payload.slug}`);
  revalidatePath("/shop");
  redirect("/admin/products");
}

/** Toggle a product's active (published) state. */
export async function toggleProductActive(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("products").update({ active }).eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

export async function deleteProduct(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}
