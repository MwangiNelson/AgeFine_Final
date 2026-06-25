"use server";

import { requireAdmin } from "@/lib/supabase/admin-guard";
import { generateHtml, type AiResult } from "@/lib/groq";
import { SITE } from "@/lib/site";

const SYSTEM_PROMPT = `You are the in-house copywriter for ${SITE.name}, a cosmetic, dermatology and nutrition clinic in Nairobi with a skincare shop. We sell dermatologist-led skincare products.

Write an elegant, trustworthy description for a single skincare product. Audience: shoppers browsing the online store. Tone: warm, premium, clinically credible — never hypey or making medical guarantees.

Return ONLY valid HTML (no markdown, no code fences, no <html>/<body> wrapper). Use this structure:
- One short <p> paragraph describing the product and who it's for.
- An <h3>Why you'll love it</h3> heading followed by a <ul> of 3-5 concise <li> benefits.
- Optionally a final <p> with a brief "How to use" line.
Keep it under ~160 words total. Do not invent specific prices or make medical claims.`;

/** Generate a rich-HTML description (incl. benefits) for a product via Groq. */
export async function generateProductContent(name: string, category: string): Promise<AiResult> {
  await requireAdmin();
  if (!name.trim()) return { error: "Add a product name first, then generate." };
  return generateHtml(SYSTEM_PROMPT, `Product name: ${name.trim()}\nCategory: ${category || "Skincare"}`);
}
