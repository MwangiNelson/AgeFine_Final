import "server-only";

// Groq's OpenAI-compatible chat completions endpoint (free tier).
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

export interface AiResult {
  html?: string;
  error?: string;
}

/**
 * Call Groq with a system + user prompt and return a cleaned HTML string.
 * Shared by the service and product "Generate with AI" actions. Strips any
 * stray markdown code fences the model may wrap around the HTML.
 */
export async function generateHtml(system: string, user: string): Promise<AiResult> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return { error: "AI is not configured yet — add GROQ_API_KEY to your environment." };

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        temperature: 0.7,
        max_tokens: 800,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      return { error: `AI request failed (${res.status}). ${detail.slice(0, 200)}` };
    }

    const data = await res.json();
    const raw: string = data?.choices?.[0]?.message?.content ?? "";
    const html = raw
      .replace(/^\s*```(?:html)?\s*/i, "")
      .replace(/\s*```\s*$/i, "")
      .trim();

    if (!html) return { error: "The AI returned an empty response — try again." };
    return { html };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "AI request failed." };
  }
}
