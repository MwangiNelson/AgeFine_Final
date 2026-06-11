"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { TextField, TextAreaField, SelectField } from "@/components/FormField";
import type { Product, Category } from "@/lib/supabaseClient";
import type { ProductActionState } from "@/app/admin/products/actions";

type Action = (prev: ProductActionState, formData: FormData) => Promise<ProductActionState>;

export default function ProductForm({
  action,
  categories,
  product,
}: {
  action: Action;
  categories: Category[];
  product?: Product;
}) {
  const [state, formAction, pending] = useActionState<ProductActionState, FormData>(action, {});
  const [existingImages, setExistingImages] = useState<string[]>(product?.image_urls ?? []);
  const fieldErrors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="flex flex-col gap-6 max-w-[680px]">
      {state.error && (
        <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
          {state.error}
        </div>
      )}

      <TextField label="Name" name="name" required defaultValue={product?.name ?? ""} error={fieldErrors.name} />

      <TextField
        label="Slug"
        name="slug"
        hint="URL path, e.g. vitamin-c-serum. Leave blank to generate from the name."
        defaultValue={product?.slug ?? ""}
      />

      <TextAreaField label="Description" name="description" defaultValue={product?.description ?? ""} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <TextField
          label="Price (KES)"
          name="price_kes"
          type="number"
          required
          inputMode="numeric"
          min={0}
          step={1}
          defaultValue={product?.price_kes ?? ""}
          error={fieldErrors.price_kes}
        />
        <TextField
          label="Stock"
          name="stock"
          type="number"
          inputMode="numeric"
          min={0}
          step={1}
          defaultValue={product?.stock ?? 0}
          error={fieldErrors.stock}
        />
      </div>

      <SelectField label="Category" name="category_id" defaultValue={product?.category_id ?? ""}>
        <option value="">— None —</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </SelectField>

      {/* Images */}
      <div>
        <span className="field-label">Images</span>
        {existingImages.length > 0 && (
          <ul className="list-none p-0 m-0 flex flex-wrap gap-3 mb-3">
            {existingImages.map((url) => (
              <li key={url} className="relative">
                {/* hidden input preserves this URL through submit */}
                <input type="hidden" name="existing_images" value={url} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-md" />
                <button
                  type="button"
                  onClick={() => setExistingImages((imgs) => imgs.filter((u) => u !== url))}
                  aria-label="Remove image"
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
          name="images"
          accept="image/*"
          multiple
          className="font-sans text-sm text-plum-soft file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-[var(--line)] file:bg-white file:font-sans file:text-sm file:text-plum file:cursor-pointer"
        />
        <p className="font-sans text-xs text-plum-soft mt-2">Upload one or more images. The first is used as the main photo.</p>
      </div>

      {/* Active */}
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" name="active" defaultChecked={product?.active ?? true} className="w-4 h-4 accent-[var(--plum)]" />
        <span className="font-sans text-sm text-plum">Active (visible in the shop)</span>
      </label>

      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
        <Link href="/admin/products" className="btn btn-outline">Cancel</Link>
      </div>
    </form>
  );
}
