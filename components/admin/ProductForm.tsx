"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import Link from "next/link";
import RichTextEditor, { type RichTextEditorHandle } from "@/components/admin/RichTextEditor";
import { generateProductContent } from "@/app/admin/products/ai";
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
  const fieldErrors = state.fieldErrors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [categoryId, setCategoryId] = useState(product?.category_id ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [existingImages, setExistingImages] = useState<string[]>(product?.image_urls ?? []);

  const editorRef = useRef<RichTextEditorHandle>(null);
  const [aiPending, startAi] = useTransition();
  const [aiError, setAiError] = useState("");

  function handleGenerate() {
    setAiError("");
    const categoryName = categories.find((c) => c.id === categoryId)?.name ?? "";
    startAi(async () => {
      const result = await generateProductContent(name, categoryName);
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

      {/* Title */}
      <div>
        <input
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Untitled product"
          aria-label="Product name"
          aria-invalid={fieldErrors.name ? "true" : undefined}
          className="w-full bg-transparent border-0 border-b font-serif text-plum text-3xl md:text-4xl leading-tight py-2 focus:outline-none focus:border-rose placeholder:text-plum-soft/40"
          style={{ borderColor: fieldErrors.name ? "#9b2c2c" : "var(--line)" }}
        />
        {fieldErrors.name && <p className="field-error" role="alert">{fieldErrors.name}</p>}
      </div>

      {/* Category pills */}
      <fieldset>
        <legend className="field-label mb-3">Category</legend>
        <input type="hidden" name="category_id" value={categoryId} />
        <div className="flex flex-wrap gap-2">
          {[{ id: "", name: "Uncategorised" }, ...categories].map((c) => {
            const selected = categoryId === c.id;
            return (
              <button
                key={c.id || "none"}
                type="button"
                onClick={() => setCategoryId(c.id)}
                aria-pressed={selected}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full border font-sans text-sm transition-colors"
                style={{
                  borderColor: selected ? "var(--rose)" : "var(--line)",
                  background: selected ? "#F8ECEA" : "#fff",
                  color: selected ? "var(--rose)" : "var(--plum-soft)",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0l-7-7A2 2 0 013 12.2V5a2 2 0 012-2h7.2a2 2 0 011.4.6l7 7a2 2 0 010 2.8z" /><circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" /></svg>
                {c.name}
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
          Shown on the product page. The “Generate with AI” button drafts copy from the name &amp; category.
        </p>
      </div>

      {/* Price + stock */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        <div>
          <label htmlFor="price" className="field-label">Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 font-sans text-sm text-plum-soft pointer-events-none">KES</span>
            <input
              id="price"
              name="price_kes"
              type="number"
              required
              inputMode="numeric"
              min={0}
              step={1}
              defaultValue={product?.price_kes ?? ""}
              className="field-input !pl-12"
              aria-invalid={fieldErrors.price_kes ? "true" : undefined}
            />
          </div>
          {fieldErrors.price_kes && <p className="field-error" role="alert">{fieldErrors.price_kes}</p>}
        </div>

        <div>
          <label htmlFor="stock" className="field-label">Stock</label>
          <input
            id="stock"
            name="stock"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            defaultValue={product?.stock ?? 0}
            className="field-input"
            aria-invalid={fieldErrors.stock ? "true" : undefined}
          />
          {fieldErrors.stock && <p className="field-error" role="alert">{fieldErrors.stock}</p>}
          <p className="font-sans text-xs text-plum-soft mt-2">Units available. 0 shows as “currently unavailable”.</p>
        </div>
      </div>

      {/* Images */}
      <div>
        <span className="field-label">Images</span>
        {existingImages.length > 0 && (
          <ul className="list-none p-0 m-0 flex flex-wrap gap-3 mb-3">
            {existingImages.map((url) => (
              <li key={url} className="relative">
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
          className="block font-sans text-sm text-plum-soft file:mr-3 file:py-2 file:px-4 file:rounded-md file:border file:border-[var(--line)] file:bg-white file:font-sans file:text-sm file:text-plum file:cursor-pointer"
        />
        <p className="font-sans text-xs text-plum-soft mt-2">Upload one or more images. The first is used as the main photo.</p>
      </div>

      {/* CTAs */}
      <div className="flex items-center gap-3 pt-2 border-t" style={{ borderColor: "var(--line)" }}>
        <button type="submit" name="intent" value="publish" className="btn btn-primary mt-6" disabled={pending}>
          {pending ? "Saving…" : "Publish"}
        </button>
        <button type="submit" name="intent" value="draft" className="btn btn-outline mt-6" disabled={pending}>
          Save as draft
        </button>
        <Link href="/admin/products" className="font-sans text-sm text-plum-soft hover:text-plum transition-colors no-underline mt-6 px-2">Cancel</Link>
      </div>
    </form>
  );
}
