"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import {
  SERVICE_CATEGORIES,
  DURATION_MIN_MINUTES,
  DURATION_MAX_MINUTES,
  DURATION_STEP_MINUTES,
  formatDuration,
} from "@/lib/admin";
import { generateServiceContent } from "@/app/admin/services/ai";
import type { Service } from "@/lib/supabaseClient";
import type { ServiceActionState } from "@/app/admin/services/actions";

type Action = (prev: ServiceActionState, formData: FormData) => Promise<ServiceActionState>;

function CategoryIcon({ icon }: { icon: string }) {
  const common = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, "aria-hidden": true } as const;
  switch (icon) {
    case "sparkle":
      return <svg {...common}><path d="M12 3l1.8 4.9L18 9l-4.2 1.1L12 15l-1.8-4.9L6 9l4.2-1.1L12 3zM18 14l.9 2.2L21 17l-2.1.8L18 20l-.9-2.2L15 17l2.1-.8L18 14z" /></svg>;
    case "syringe":
      return <svg {...common}><path d="M18 2l4 4M17 7l-9 9-4 1 1-4 9-9zM14 5l5 5M9 12l3 3" /></svg>;
    case "gem":
      return <svg {...common}><path d="M6 3h12l3 6-9 12L3 9l3-6zM3 9h18M9 3L6 9l6 12 6-12-3-6" /></svg>;
    case "chat":
    default:
      return <svg {...common}><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h9a4 4 0 014 4z" /></svg>;
  }
}

export default function ServiceForm({ action, service }: { action: Action; service?: Service }) {
  const [state, formAction, pending] = useActionState<ServiceActionState, FormData>(action, {});
  const fieldErrors = state.fieldErrors ?? {};

  const [category, setCategory] = useState(service?.category ?? SERVICE_CATEGORIES[0].value);
  const [description, setDescription] = useState(service?.description ?? "");
  const [duration, setDuration] = useState<number>(service?.duration_min ?? 60);
  const [hero, setHero] = useState<string>(service?.image_url ?? "");
  const [gallery, setGallery] = useState<string[]>(service?.gallery_urls ?? []);
  const [name, setName] = useState(service?.name ?? "");

  const editorRef = useRef<RichTextEditorHandle>(null);
  const [aiPending, startAi] = useTransition();
  const [aiError, setAiError] = useState<string>("");

  function handleGenerate() {
    setAiError("");
    startAi(async () => {
      const result = await generateServiceContent(name, category);
      if (result.error) setAiError(result.error);
      else if (result.html) editorRef.current?.setContent(result.html);
    });
  }

  return (
    <form action={formAction} className="flex flex-col gap-8 max-w-[760px]">
      {state.error && (
        <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
          {state.error}
        </div>
      )}

      {/* Title (Google-Photos style) */}
      <div>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Untitled service"
          aria-label="Service name"
          aria-invalid={fieldErrors.name ? "true" : undefined}
          className="w-full bg-transparent border-0 border-b font-serif text-plum text-3xl md:text-4xl leading-tight py-2 focus:outline-none focus:border-rose placeholder:text-plum-soft/40"
          style={{ borderColor: fieldErrors.name ? "#9b2c2c" : "var(--line)" }}
        />
        {fieldErrors.name && <p className="field-error" role="alert">{fieldErrors.name}</p>}
      </div>

      {/* Category picker */}
      <fieldset>
        <legend className="field-label mb-3">Category</legend>
        <input type="hidden" name="category" value={category} />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICE_CATEGORIES.map((c) => {
            const selected = category === c.value;
            return (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                aria-pressed={selected}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border text-center transition-colors"
                style={{
                  borderColor: selected ? "var(--rose)" : "var(--line)",
                  background: selected ? "#F8ECEA" : "#fff",
                  color: selected ? "var(--rose)" : "var(--plum-soft)",
                }}
              >
                <CategoryIcon icon={c.icon} />
                <span className="font-sans text-xs leading-tight text-plum">{c.label}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {/* Description (rich text + AI) */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-2">
          <span className="field-label !mb-0">Description</span>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={aiPending}
            className="inline-flex items-center gap-1.5 font-sans text-xs px-3 py-1.5 rounded-full border transition-colors disabled:opacity-50"
            style={{ borderColor: "var(--gold-soft)", color: "var(--gold-text)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M12 3l1.8 4.9L18 9l-4.2 1.1L12 15l-1.8-4.9L6 9l4.2-1.1L12 3z" /></svg>
            {aiPending ? "Generating…" : "Generate with AI"}
          </button>
        </div>
        {aiError && <p className="field-error mb-2" role="alert">{aiError}</p>}
        <input type="hidden" name="description" value={description} />
        <RichTextEditor ref={editorRef} value={description} onChange={setDescription} />
        <p className="font-sans text-xs text-plum-soft mt-2">
          Shown on the service page. The “Generate with AI” button drafts a description and benefits from the name &amp; category.
        </p>
      </div>

      {/* Duration + price */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label htmlFor="duration" className="field-label">Duration</label>
          <div className="flex items-center gap-4">
            <input
              id="duration"
              name="duration_min"
              type="range"
              min={DURATION_MIN_MINUTES}
              max={DURATION_MAX_MINUTES}
              step={DURATION_STEP_MINUTES}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="flex-1 accent-[var(--rose)]"
            />
            <span className="font-sans text-sm text-plum tabular-nums whitespace-nowrap min-w-[72px] text-right">
              {formatDuration(duration)}
            </span>
          </div>
          {fieldErrors.duration_min && <p className="field-error" role="alert">{fieldErrors.duration_min}</p>}
        </div>

        <div>
          <label htmlFor="price" className="field-label">Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-plum-soft pointer-events-none">KES</span>
            <input
              id="price"
              name="price_kes"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={service?.price_kes ?? ""}
              placeholder="On consultation"
              className="field-input !pl-12"
              aria-invalid={fieldErrors.price_kes ? "true" : undefined}
            />
          </div>
          {fieldErrors.price_kes && <p className="field-error" role="alert">{fieldErrors.price_kes}</p>}
          <p className="font-sans text-xs text-plum-soft mt-2">Leave blank for “priced on consultation”.</p>
        </div>
      </div>

      {/* Main image */}
      <div>
        <span className="field-label">Main image</span>
        {hero && (
          <div className="relative inline-block mb-3">
            <input type="hidden" name="existing_hero" value={hero} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} alt="" className="w-32 h-24 object-cover rounded-md" />
            <button
              type="button"
              onClick={() => setHero("")}
              aria-label="Remove main image"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center"
              style={{ background: "#9b2c2c" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        )}
        <input
          type="file"
          name="hero_image"
          accept="image/*"
          className="block font-sans text-sm text-plum-soft file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-[var(--line)] file:bg-white file:font-sans file:text-sm file:text-plum file:cursor-pointer"
        />
        <p className="font-sans text-xs text-plum-soft mt-2">The main photo — used on the landing carousel, cards and the service page header.</p>
      </div>

      {/* Gallery */}
      <div>
        <span className="field-label">Gallery</span>
        {gallery.length > 0 && (
          <ul className="list-none p-0 m-0 flex flex-wrap gap-3 mb-3">
            {gallery.map((url) => (
              <li key={url} className="relative">
                <input type="hidden" name="existing_gallery" value={url} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => setGallery((imgs) => imgs.filter((u) => u !== url))}
                  aria-label="Remove gallery image"
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full text-white flex items-center justify-center"
                  style={{ background: "#9b2c2c" }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </li>
            ))}
          </ul>
        )}
        <input
          type="file"
          name="gallery_images"
          accept="image/*"
          multiple
          className="block font-sans text-sm text-plum-soft file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-[var(--line)] file:bg-white file:font-sans file:text-sm file:text-plum file:cursor-pointer"
        />
        <p className="font-sans text-xs text-plum-soft mt-2">“In the treatment room” photos shown on the service page.</p>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
        <button type="submit" name="intent" value="publish" className="btn btn-primary mt-6" disabled={pending}>
          {pending ? "Saving…" : "Publish"}
        </button>
        <button type="submit" name="intent" value="draft" className="btn btn-outline mt-6" disabled={pending}>
          Save as draft
        </button>
        <Link href="/admin/services" className="font-sans text-sm text-plum-soft hover:text-plum transition-colors no-underline mt-6 px-2">Cancel</Link>
      </div>
    </form>
  );
}
