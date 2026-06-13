"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { TextField, TextAreaField } from "@/components/FormField";
import type { Service } from "@/lib/supabaseClient";
import type { ServiceActionState } from "@/app/admin/services/actions";

type Action = (prev: ServiceActionState, formData: FormData) => Promise<ServiceActionState>;

export default function ServiceForm({ action, service }: { action: Action; service?: Service }) {
  const [state, formAction, pending] = useActionState<ServiceActionState, FormData>(action, {});
  const [hero, setHero] = useState<string>(service?.image_url ?? "");
  const [gallery, setGallery] = useState<string[]>(service?.gallery_urls ?? []);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-[680px]">
      {state.error && (
        <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
          {state.error}
        </div>
      )}

      <TextField label="Name" name="name" required defaultValue={service?.name ?? ""} error={fieldErrors.name} />

      <TextField
        label="Slug"
        name="slug"
        hint="URL path, e.g. chemical-peels. Leave blank to generate from the name."
        defaultValue={service?.slug ?? ""}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TextField
          label="Category"
          name="category"
          hint="Groups the services page, e.g. Facials & Glow."
          defaultValue={service?.category ?? "Treatments"}
        />
        <TextField
          label="Tagline"
          name="tagline"
          hint="Short line shown on cards and the carousel."
          defaultValue={service?.tagline ?? ""}
        />
      </div>

      <TextAreaField label="Description" name="description" defaultValue={service?.description ?? ""} />

      <TextAreaField
        label="Benefits (one per line)"
        name="benefits"
        hint="Shown as the “What it helps with” checklist."
        defaultValue={(service?.benefits ?? []).join("\n")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <TextField
          label="Duration (min)"
          name="duration_min"
          type="number"
          required
          inputMode="numeric"
          min={5}
          step={5}
          defaultValue={service?.duration_min ?? 30}
          error={fieldErrors.duration_min}
        />
        <TextField
          label="Price (KES)"
          name="price_kes"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          hint="Leave blank for “priced on consultation”."
          defaultValue={service?.price_kes ?? ""}
          error={fieldErrors.price_kes}
        />
        <TextField
          label="Sort order"
          name="sort_order"
          type="number"
          inputMode="numeric"
          step={1}
          defaultValue={service?.sort_order ?? 0}
          error={fieldErrors.sort_order}
        />
      </div>

      {/* Hero image */}
      <div>
        <span className="field-label">Hero image</span>
        {hero && (
          <div className="relative inline-block mb-3">
            <input type="hidden" name="existing_hero" value={hero} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero} alt="" className="w-32 h-24 object-cover rounded-md" />
            <button
              type="button"
              onClick={() => setHero("")}
              aria-label="Remove hero image"
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
        <p className="font-sans text-xs text-plum-soft mt-2">
          The main photo — used on the landing carousel, cards and the service page header.
        </p>
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
        <p className="font-sans text-xs text-plum-soft mt-2">
          “In the treatment room” photos shown on the service page — e.g. saved posts from
          the clinic&rsquo;s Instagram.
        </p>
      </div>

      {/* Flags */}
      <div className="flex flex-col gap-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="featured" defaultChecked={service?.featured ?? false} className="w-4 h-4 accent-[var(--plum)]" />
          <span className="font-sans text-sm text-plum">Featured (appears in the landing hero carousel)</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" name="active" defaultChecked={service?.active ?? true} className="w-4 h-4 accent-[var(--plum)]" />
          <span className="font-sans text-sm text-plum">Active (visible on the site)</span>
        </label>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : service ? "Save changes" : "Create service"}
        </button>
        <Link href="/admin/services" className="btn btn-outline">Cancel</Link>
      </div>
    </form>
  );
}
