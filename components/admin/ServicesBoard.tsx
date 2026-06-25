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
import type { Service } from "@/lib/supabaseClient";
import { reorderServices, deleteService, type ServiceOrderUpdate } from "@/app/admin/services/actions";

const FEATURED_LIMIT = 5;
type ContainerId = "featured" | "all";
type Buckets = Record<ContainerId, Service[]>;

/* ---------- Row ---------- */

function ServiceCard({ service, isSuper, dragging }: { service: Service; isSuper: boolean; dragging?: boolean }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="flex items-center gap-3 min-w-0 w-full" style={{ opacity: pending ? 0.5 : 1 }}>
      <div
        className="flex-none w-10 h-10 rounded-md bg-cover bg-center"
        style={{ background: service.image_url ? `url(${service.image_url}) center/cover` : "linear-gradient(150deg,#F3E0DE,#D7A9A2)" }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <span className="font-sans text-sm text-plum block truncate">{service.name}</span>
        <span className="font-sans text-xs text-plum-soft">
          {service.category} · {service.duration_min} min · {service.price_kes != null ? `KES ${service.price_kes.toLocaleString()}` : "On consultation"}
        </span>
      </div>

      {/* Status */}
      <span
        className="hidden sm:inline-block font-sans text-[11px] px-2.5 py-1 rounded-full border whitespace-nowrap"
        style={{
          borderColor: service.active ? "var(--gold)" : "var(--line)",
          background: service.active ? "var(--cream)" : "transparent",
          color: service.active ? "var(--gold-text)" : "var(--plum-soft)",
        }}
      >
        {service.active ? "Published" : "Draft"}
      </span>

      {!dragging && (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/services/${service.id}`}
            aria-label={`Edit ${service.name}`}
            title="Edit"
            className="w-9 h-9 grid place-items-center rounded-md text-white no-underline transition-colors"
            style={{ background: "var(--plum)" }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></svg>
          </Link>
          {isSuper && (confirming ? (
            <span className="flex items-center gap-1">
              <button type="button" onClick={() => startTransition(() => deleteService(service.id))} disabled={pending}
                className="font-sans text-xs px-2 py-1.5 rounded-md text-white" style={{ background: "#9b2c2c" }}>
                Delete
              </button>
              <button type="button" onClick={() => setConfirming(false)} className="font-sans text-xs px-1.5 py-1.5 text-plum-soft">✕</button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} aria-label={`Delete ${service.name}`} title="Delete"
              className="w-9 h-9 grid place-items-center rounded-md text-plum-soft hover:text-rose transition-colors">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m-9 0v14a2 2 0 002 2h6a2 2 0 002-2V6" /></svg>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableRow({ service, isSuper }: { service: Service; isSuper: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: service.id });
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
        aria-label={`Drag ${service.name}`}
        className="flex-none w-7 h-9 grid place-items-center text-plum-soft hover:text-plum cursor-grab active:cursor-grabbing touch-none"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="6" r="1.4" /><circle cx="15" cy="6" r="1.4" /><circle cx="9" cy="12" r="1.4" /><circle cx="15" cy="12" r="1.4" /><circle cx="9" cy="18" r="1.4" /><circle cx="15" cy="18" r="1.4" /></svg>
      </button>
      <ServiceCard service={service} isSuper={isSuper} />
    </li>
  );
}

/* ---------- Droppable section ---------- */

function Section({ id, title, hint, services, isSuper, full }: {
  id: ContainerId; title: string; hint: string; services: Service[]; isSuper: boolean; full?: boolean;
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
          <span className="font-sans text-xs text-plum-soft tabular-nums">{services.length}/{FEATURED_LIMIT}{full ? " · full" : ""}</span>
        )}
      </div>
      <SortableContext id={id} items={services.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ul ref={setNodeRef} className="list-none m-0 p-0 min-h-[64px]">
          {services.length === 0 ? (
            <li className="px-4 md:px-5 py-6 font-sans text-sm text-plum-soft italic text-center">
              {id === "featured" ? "Drag up to 5 services here to feature them on the homepage." : "No services."}
            </li>
          ) : (
            services.map((s) => <SortableRow key={s.id} service={s} isSuper={isSuper} />)
          )}
        </ul>
      </SortableContext>
    </section>
  );
}

/* ---------- Board ---------- */

export default function ServicesBoard({ services, isSuper }: { services: Service[]; isSuper: boolean }) {
  const router = useRouter();
  const [buckets, setBuckets] = useState<Buckets>(() => ({
    featured: services.filter((s) => s.featured),
    all: services.filter((s) => !s.featured),
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
  const activeService = all.find((s) => s.id === activeId) ?? null;
  const total = all.length;
  const published = all.filter((s) => s.active).length;

  function containerOf(state: Buckets, id: string): ContainerId | null {
    if (id === "featured" || id === "all") return id;
    if (state.featured.some((s) => s.id === id)) return "featured";
    if (state.all.some((s) => s.id === id)) return "all";
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

    // Only super-admins may move items across the featured boundary.
    if (!isSuper) return;
    // Respect the 5-item featured cap.
    if (to === "featured" && cur.featured.length >= FEATURED_LIMIT) return;

    const item = cur[from].find((s) => s.id === active.id);
    if (!item) return;
    const nextFrom = cur[from].filter((s) => s.id !== active.id);
    const overIndex = cur[to].findIndex((s) => s.id === over.id);
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
    const oldIndex = list.findIndex((s) => s.id === active.id);
    const overIndex = list.findIndex((s) => s.id === over.id);
    const newIndex = overIndex === -1 ? list.length - 1 : overIndex;

    let next = cur;
    if (oldIndex !== -1 && oldIndex !== newIndex) {
      next = { ...cur, [container]: arrayMove(list, oldIndex, newIndex) };
    }
    setBoth(next);
    persist(next);
  }

  function persist(state: Buckets) {
    // Sequential global ordering: featured block first, then the rest.
    const ordered = [...state.featured, ...state.all];
    const updates: ServiceOrderUpdate[] = ordered.map((s, i) => ({
      id: s.id,
      sort_order: i,
      featured: state.featured.some((f) => f.id === s.id),
    }));
    startTransition(async () => {
      const res = await reorderServices(updates);
      if (res.error) {
        setError(res.error);
        router.refresh(); // resync from the server
      }
    });
  }

  const featuredFull = buckets.featured.length >= FEATURED_LIMIT;

  return (
    <div className="flex flex-col gap-6">
      {/* Stats banner */}
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
          title="On the homepage hero"
          hint={isSuper ? "Drag services in and reorder — top 5 show in the hero carousel." : "Managed by a super-admin."}
          services={buckets.featured}
          isSuper={isSuper}
          full={featuredFull}
        />
        <Section
          id="all"
          title="All services"
          hint="Drag to reorder how they appear on the site."
          services={buckets.all}
          isSuper={isSuper}
        />
        <DragOverlay>
          {activeService ? (
            <div className="surface-card px-4 py-3 shadow-[0_14px_34px_rgba(60,35,49,0.18)]">
              <ServiceCard service={activeService} isSuper={isSuper} dragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
