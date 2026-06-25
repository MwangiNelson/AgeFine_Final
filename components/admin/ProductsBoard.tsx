"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext, DragOverlay, closestCorners, PointerSensor, KeyboardSensor,
  useSensor, useSensors, useDroppable,
  type DragStartEvent, type DragOverEvent, type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, sortableKeyboardCoordinates, arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Product } from "@/lib/supabaseClient";
import { reorderProducts, deleteProduct, type ProductOrderUpdate } from "@/app/admin/products/actions";

const FEATURED_LIMIT = 4;
type ContainerId = "featured" | "all";
type Buckets = Record<ContainerId, Product[]>;

function ProductCard({ product, categoryName, isSuper, dragging }: {
  product: Product; categoryName: string | null; isSuper: boolean; dragging?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const img = product.image_urls?.[0];

  return (
    <div className="flex items-center gap-3 min-w-0 w-full" style={{ opacity: pending ? 0.5 : 1 }}>
      <div
        className="flex-none w-10 h-10 rounded-md bg-cover bg-center"
        style={{ background: img ? `url(${img}) center/cover` : "linear-gradient(150deg,#F3E0DE,#D7A9A2)" }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <span className="font-sans text-sm text-plum block truncate">{product.name}</span>
        <span className="font-sans text-xs text-plum-soft">
          {categoryName ?? "Uncategorised"} · KES {product.price_kes.toLocaleString()} · {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
        </span>
      </div>

      <span
        className="hidden sm:inline-block font-sans text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap"
        style={{
          borderColor: product.active ? "var(--gold)" : "var(--line)",
          background: product.active ? "var(--cream)" : "transparent",
          color: product.active ? "var(--gold-text)" : "var(--plum-soft)",
        }}
      >
        {product.active ? "Published" : "Draft"}
      </span>

      {!dragging && (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/products/${product.id}`}
            aria-label={`Edit ${product.name}`}
            title="Edit"
            className="w-9 h-9 grid place-items-center rounded-md text-white no-underline transition-colors"
            style={{ background: "var(--plum)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
          </Link>
          {isSuper && (confirming ? (
            <span className="flex items-center gap-1">
              <button type="button" onClick={() => startTransition(() => deleteProduct(product.id))} disabled={pending}
                className="font-sans text-xs px-2 py-1.5 rounded-md text-white" style={{ background: "#9b2c2c" }}>
                Delete
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="font-sans text-xs px-1.5 py-1.5 text-plum-soft">✕</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete ${product.name}`} title="Delete"
              className="w-9 h-9 grid place-items-center rounded-md text-plum-soft hover:text-rose transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V6" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableRow({ product, categoryName, isSuper }: { product: Product; categoryName: string | null; isSuper: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }}
      className="flex items-center gap-2 px-3 md:px-4 py-3 border-b last:border-b-0 bg-white"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${product.name}`}
        className="flex-none w-7 h-9 grid place-items-center text-plum-soft hover:text-plum cursor-grab active:cursor-grabbing touch-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
      </button>
      <ProductCard product={product} categoryName={categoryName} isSuper={isSuper} />
    </li>
  );
}

function Section({ id, title, hint, products, categoryNames, isSuper, full }: {
  id: ContainerId; title: string; hint: string; products: Product[]; categoryNames: Record<string, string>; isSuper: boolean; full?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section className="surface-card overflow-hidden" style={{ outline: isOver ? "2px solid var(--rose)" : "none", outlineOffset: -2 }}>
      <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 border-b" style={{ borderColor: "var(--line)", background: id === "featured" ? "var(--cream)" : "#fff" }}>
        <div>
          <h2 className="font-sans text-[11px] tracking-[0.1em] uppercase text-plum">{title}</h2>
          <p className="font-sans text-xs text-plum-soft mt-0.5">{hint}</p>
        </div>
        {id === "featured" && (
          <span className="font-sans text-xs text-plum-soft tabular-nums">{products.length}/{FEATURED_LIMIT}{full ? " · full" : ""}</span>
        )}
      </div>
      <SortableContext id={id} items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="list-none m-0 p-0 min-h-[64px]">
          {products.length === 0 ? (
            <li className="px-4 md:px-5 py-6 font-sans text-sm text-plum-soft italic text-center">
              {id === "featured" ? "Drag up to 4 products here to feature them on the homepage." : "No products."}
            </li>
          ) : (
            products.map((p) => <SortableRow key={p.id} product={p} categoryName={categoryNames[p.category_id ?? ""] ?? null} isSuper={isSuper} />)
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

export default function ProductsBoard({ products, categoryNames, isSuper }: {
  products: Product[]; categoryNames: Record<string, string>; isSuper: boolean;
}) {
  const router = useRouter();
  const [buckets, setBuckets] = useState<Buckets>(() => ({
    featured: products.filter((p) => p.featured),
    all: products.filter((p) => !p.featured),
  }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Mirror buckets in a ref so drag handlers read live state (the setBuckets
  // updater runs after the handler, so closing over `buckets` would be stale).
  const bucketsRef = useRef(buckets);
  function setBoth(next: Buckets) {
    bucketsRef.current = next;
    setBuckets(next);
  }

  const all = [...buckets.featured, ...buckets.all];
  const activeProduct = all.find((p) => p.id === activeId) ?? null;
  const total = all.length;
  const published = all.filter((p) => p.active).length;

  function containerOf(state: Buckets, id: string): ContainerId | null {
    if (id === "featured" || id === "all") return id;
    if (state.featured.some((p) => p.id === id)) return "featured";
    if (state.all.some((p) => p.id === id)) return "all";
    return null;
  }

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
    setError("");
  }

  function handleDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const cur = bucketsRef.current;
    const from = containerOf(cur, String(active.id));
    const to = containerOf(cur, String(over.id));
    if (!from || !to || from === to) return;
    if (!isSuper) return;
    if (to === "featured" && cur.featured.length >= FEATURED_LIMIT) return;

    const item = cur[from].find((p) => p.id === active.id);
    if (!item) return;
    const nextFrom = cur[from].filter((p) => p.id !== active.id);
    const overIndex = cur[to].findIndex((p) => p.id === over.id);
    const insertAt = overIndex >= 0 ? overIndex : cur[to].length;
    const nextTo = [...cur[to]];
    nextTo.splice(insertAt, 0, { ...item, featured: to === "featured" });
    setBoth({ ...cur, [from]: nextFrom, [to]: nextTo });
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    setActiveId(null);
    const cur = bucketsRef.current;
    if (!over) { persist(cur); return; }

    const container = containerOf(cur, String(over.id)) ?? containerOf(cur, String(active.id));
    if (!container) return;

    const list = cur[container];
    const oldIndex = list.findIndex((p) => p.id === active.id);
    const overIndex = list.findIndex((p) => p.id === over.id);
    const newIndex = overIndex === -1 ? list.length - 1 : overIndex;

    let next = cur;
    if (oldIndex !== -1 && oldIndex !== newIndex) {
      next = { ...cur, [container]: arrayMove(list, oldIndex, newIndex) };
    }
    setBoth(next);
    persist(next);
  }

  function persist(state: Buckets) {
    const ordered = [...state.featured, ...state.all];
    const updates: ProductOrderUpdate[] = ordered.map((p, i) => ({
      id: p.id,
      sort_order: i,
      featured: state.featured.some((f) => f.id === p.id),
    }));
    startTransition(async () => {
      const res = await reorderProducts(updates);
      if (res.error) {
        setError(res.error);
        router.refresh();
      }
    });
  }

  const featuredFull = buckets.featured.length >= FEATURED_LIMIT;

  return (
    <div className="flex flex-col gap-6">
      <div className="surface-card px-5 py-4 flex items-center gap-6 md:gap-10">
        {[
          { label: "Total", value: total },
          { label: "Published", value: published },
          { label: "Drafts", value: total - published },
        ].map((s) => (
          <div key={s.label}>
            <p className="font-serif text-plum text-2xl md:text-3xl leading-none">{s.value}</p>
            <p className="font-sans text-[11px] tracking-[0.1em] uppercase text-plum-soft mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {error && (
        <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
          {error}
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <Section
          id="featured"
          title="Featured on the homepage"
          hint={isSuper ? "Drag products in and reorder — these fill the homepage bestsellers." : "Managed by a super-admin."}
          products={buckets.featured}
          categoryNames={categoryNames}
          isSuper={isSuper}
          full={featuredFull}
        />
        <Section
          id="all"
          title="All products"
          hint="Drag to reorder how they appear in the shop."
          products={buckets.all}
          categoryNames={categoryNames}
          isSuper={isSuper}
        />
        <DragOverlay>
          {activeProduct ? (
            <div className="surface-card px-4 py-3 shadow-[0_14px_34px_rgba(60,35,49,0.18)]">
              <ProductCard product={activeProduct} categoryName={categoryNames[activeProduct.category_id ?? ""] ?? null} isSuper={isSuper} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
