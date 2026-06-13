import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { supabase } from "@/lib/supabaseClient";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/shop`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/careers`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  // Dynamic product + service pages (active only). Degrades gracefully if
  // Supabase is unreachable.
  let productRoutes: MetadataRoute.Sitemap = [];
  let serviceRoutes: MetadataRoute.Sitemap = [];
  try {
    const [{ data: products }, { data: services }] = await Promise.all([
      supabase.from("products").select("slug, created_at").eq("active", true),
      supabase.from("services").select("slug, created_at").eq("active", true),
    ]);
    productRoutes = (products ?? []).map((p) => ({
      url: `${SITE_URL}/shop/${p.slug}`,
      lastModified: p.created_at ? new Date(p.created_at) : now,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    serviceRoutes = (services ?? []).map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      lastModified: s.created_at ? new Date(s.created_at) : now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));
  } catch {
    // Leave dynamic routes empty rather than failing the whole sitemap.
  }

  return [...staticRoutes, ...productRoutes, ...serviceRoutes];
}
