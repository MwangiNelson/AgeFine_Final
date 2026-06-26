"use server";

import { requireAdmin } from "@/lib/supabase/admin-guard";
import { generateHtml, type AiResult } from "@/lib/groq";
import { SITE } from "@/lib/site";

const SYSTEM_PROMPT = `You are the in-house copywriter for ${SITE.name}, a cosmetic, dermatology and nutrition clinic at Imaara Shopping Mall, Mombasa Road, Nairobi. We deliver science-backed aesthetic skin treatments and procedures performed by qualified dermatology, nutrition and cosmetic experts.

Write an elegant, trustworthy description for a single in-clinic treatment. Audience: prospective clients researching the treatment. Tone: warm, premium, clinically credible — never hypey or making medical guarantees.

Return ONLY valid HTML (no markdown, no code fences, no <html>/<body> wrapper). Use this structure:
- One or two <p> paragraphs explaining what the treatment is and the experience.
- An <h3>What it helps with</h3> heading followed by a <ul> of 4-6 concise <li> benefits.
Keep it under ~180 words total. Do not invent specific prices, durations, or medical claims.`;

/** Generate a rich-HTML description (incl. benefits) for a treatment via Groq. */
export async function generateServiceContent(name: string, category: string): Promise<AiResult> {
  await requireAdmin();
  if (!name.trim()) return { error: "Add a service name first, then generate." };
  return generateHtml(SYSTEM_PROMPT, `Treatment name: ${name.trim()}\nCategory: ${category || "Treatments"}`);
}
