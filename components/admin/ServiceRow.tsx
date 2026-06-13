"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { Service } from "@/lib/supabaseClient";
import { toggleServiceActive, toggleServiceFeatured, deleteService } from "@/app/admin/services/actions";

export default function ServiceRow({ service }: { service: Service }) {
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  return (
    <li
      className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_150px_90px_110px_110px_120px] gap-3 md:gap-4 items-center px-4 md:px-5 py-3.5 border-b last:border-b-0"
      style={{ borderColor: "var(--line)", opacity: pending ? 0.5 : 1 }}
    >
      {/* Service */}
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="flex-none w-11 h-11 rounded-md bg-cover bg-center"
          style={{ background: service.image_url ? `url(${service.image_url}) center/cover` : "linear-gradient(150deg,#F3E0DE,#D7A9A2)" }}
          aria-hidden="true"
        />
        <div className="min-w-0">
          <Link href={`/admin/services/${service.id}`} className="font-sans text-sm text-plum no-underline hover:text-rose transition-colors block truncate">
            {service.name}
          </Link>
          <span className="font-sans text-xs text-plum-soft md:hidden">
            {service.duration_min} min · {service.active ? "Active" : "Hidden"}
            {service.featured ? " · Carousel" : ""}
          </span>
        </div>
      </div>

      {/* Category (desktop) */}
      <span className="hidden md:block font-sans text-sm text-plum-soft truncate">{service.category}</span>

      {/* Duration (desktop) */}
      <span className="hidden md:block font-sans text-sm text-plum">{service.duration_min} min</span>

      {/* Carousel toggle (desktop) */}
      <div className="hidden md:block">
        <button
          type="button"
          onClick={() => startTransition(() => toggleServiceFeatured(service.id, !service.featured))}
          disabled={pending}
          aria-pressed={service.featured}
          aria-label={`${service.featured ? "Remove" : "Add"} ${service.name} ${service.featured ? "from" : "to"} the landing carousel`}
          className="font-sans text-xs px-3 py-1.5 rounded-full border transition-colors"
          style={{
            borderColor: service.featured ? "var(--rose)" : "var(--line)",
            background: service.featured ? "#F8ECEA" : "transparent",
            color: service.featured ? "var(--rose)" : "var(--plum-soft)",
          }}
        >
          {service.featured ? "Carousel" : "Standard"}
        </button>
      </div>

      {/* Status toggle (desktop) */}
      <div className="hidden md:block">
        <button
          type="button"
          onClick={() => startTransition(() => toggleServiceActive(service.id, !service.active))}
          disabled={pending}
          aria-pressed={service.active}
          className="font-sans text-xs px-3 py-1.5 rounded-full border transition-colors"
          style={{
            borderColor: service.active ? "var(--gold)" : "var(--line)",
            background: service.active ? "var(--cream)" : "transparent",
            color: service.active ? "var(--gold-text)" : "var(--plum-soft)",
          }}
        >
          {service.active ? "Active" : "Hidden"}
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <Link href={`/admin/services/${service.id}`} aria-label={`Edit ${service.name}`} className="font-sans text-xs px-3 py-1.5 text-plum-soft hover:text-plum transition-colors no-underline">
          Edit
        </Link>
        {confirming ? (
          <span className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => startTransition(() => deleteService(service.id))}
              disabled={pending}
              className="font-sans text-xs px-2.5 py-1.5 rounded-md text-white"
              style={{ background: "#9b2c2c" }}
            >
              Delete
            </button>
            <button type="button" onClick={() => setConfirming(false)} className="font-sans text-xs px-2 py-1.5 text-plum-soft">
              Cancel
            </button>
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            aria-label={`Delete ${service.name}`}
            className="font-sans text-xs px-3 py-1.5 text-plum-soft hover:text-rose transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
