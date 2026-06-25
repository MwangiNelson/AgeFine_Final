"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin, requireSuperAdmin, isSuperAdminUser } from "@/lib/supabase/admin-guard";
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
    description: String(formData.get("description") ?? ""),
    duration_min: String(formData.get("duration_min") ?? ""),
    price_kes: String(formData.get("price_kes") ?? ""),
    // The submit button carries the publish/draft intent.
    active: String(formData.get("intent") ?? "draft") === "publish",
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

  // New services land at the end of the (non-featured) list.
  const { data: last } = await supabase
    .from("services")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  const sort_order = (last?.sort_order ?? 0) + 1;

  const payload = { ...buildServicePayload({ ...input, ...images }), sort_order, featured: false };
  const { error } = await supabase.from("services").insert(payload);
  if (error) {
    return { error: error.message.includes("duplicate") ? "A service with that name already exists." : error.message };
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

  // buildServicePayload omits featured/sort_order so the board's ordering survives.
  const payload = buildServicePayload({ ...input, ...images });
  const { error } = await supabase.from("services").update(payload).eq("id", id);
  if (error) {
    return { error: error.message.includes("duplicate") ? "A service with that name already exists." : error.message };
  }

  revalidatePath("/admin/services");
  revalidatePath(`/services/${payload.slug}`);
  revalidatePath("/services");
  revalidatePath("/");
  redirect("/admin/services");
}

export interface ServiceOrderUpdate {
  id: string;
  sort_order: number;
  featured: boolean;
}

/**
 * Persist a drag-and-drop reorder. Any staff may reorder within a section;
 * changing the featured (homepage hero) set is super-admin only.
 */
export async function reorderServices(updates: ServiceOrderUpdate[]): Promise<{ error?: string }> {
  const user = await requireAdmin();
  const supabase = await createClient();

  const { data: current } = await supabase.from("services").select("id, featured");
  const featuredById = new Map((current ?? []).map((s) => [s.id, s.featured]));
  const featuredChanged = updates.some((u) => featuredById.get(u.id) !== u.featured);

  if (featuredChanged && !isSuperAdminUser(user)) {
    return { error: "Only a super-admin can change the homepage featured services." };
  }

  const results = await Promise.all(
    updates.map((u) =>
      supabase.from("services").update({ sort_order: u.sort_order, featured: u.featured }).eq("id", u.id)
    )
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) return { error: failed.error.message };

  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
  return {};
}

export async function deleteService(id: string): Promise<void> {
  await requireSuperAdmin();
  const supabase = await createClient();
  await supabase.from("services").delete().eq("id", id);
  revalidatePath("/admin/services");
  revalidatePath("/services");
  revalidatePath("/");
}
