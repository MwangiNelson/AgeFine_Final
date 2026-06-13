"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { buildServicePayload, validateService, isServiceValid } from "@/lib/admin";

export interface ServiceActionState {
  ok?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

const BUCKET = "service-images";

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
    category: String(formData.get("category") ?? ""),
    tagline: String(formData.get("tagline") ?? ""),
    description: String(formData.get("description") ?? ""),
    benefits: String(formData.get("benefits") ?? ""),
    duration_min: String(formData.get("duration_min") ?? ""),
    price_kes: String(formData.get("price_kes") ?? ""),
    sort_order: String(formData.get("sort_order") ?? ""),
    featured: formData.get("featured") === "on",
    active: formData.get("active") === "on",
    existingHero: String(formData.get("existing_hero") ?? ""),
    newHero: formData.get("hero_image") instanceof File ? (formData.get("hero_image") as File) : null,
    existingGallery: formData.getAll("existing_gallery").map(String).filter(Boolean),
    newGallery: formData.getAll("gallery_images").filter((f): f is File => f instanceof File),
  };
}

async function resolveImages(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: ReturnType<typeof parseForm>
): Promise<{ image_url: string | null; gallery_urls: string[] }> {
  const [heroUrl] = input.newHero && input.newHero.size > 0 ? await uploadImages(supabase, [input.newHero]) : [];
  const gallery = [...input.existingGallery, ...(await uploadImages(supabase, input.newGallery))];
  return { image_url: heroUrl || input.existingHero || null, gallery_urls: gallery };
}

export async function createService(
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  await requireAdmin();
  const supabase = await createClient();
  const input = parseForm(formData);

  const errors = validateService(input);
  if (!isServiceValid(errors)) return { fieldErrors: errors };

  let images: Awaited<ReturnType<typeof resolveImages>>;
  try {
    images = await resolveImages(supabase, input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }

  const payload = buildServicePayload({ ...input, ...images });
  const { error } = await supabase.from("services").insert(payload);
  if (error) {
    return { error: error.message.includes("duplicate") ? "A service with that slug already exists." : error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export async function updateService(
  id: string,
  _prev: ServiceActionState,
  formData: FormData
): Promise<ServiceActionState> {
  await requireAdmin();
  const supabase = await createClient();
  const input = parseForm(formData);

  const errors = validateService(input);
  if (!isServiceValid(errors)) return { fieldErrors: errors };

  let images: Awaited<ReturnType<typeof resolveImages>>;
  try {
    images = await resolveImages(supabase, input);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Image upload failed." };
  }

  const payload = buildServicePayload({ ...input, ...images });
  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) {
    return { error: error.message.includes("duplicate") ? "A service with that slug already exists." : error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath(`/services/${payload.slug}`);
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

/** Toggle a service's active (published) state. */
export async function toggleServiceActive(id: string, active: boolean): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("services").update({ active }).eq("id", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}

/** Toggle whether a service appears in the landing hero carousel. */
export async function toggleServiceFeatured(id: string, featured: boolean): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("services").update({ featured }).eq("id", id);
  revalidatePath("/admin/services");
  revalidatePath("/");
}

export async function deleteService(id: string): Promise<void> {
  await requireAdmin();
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}
