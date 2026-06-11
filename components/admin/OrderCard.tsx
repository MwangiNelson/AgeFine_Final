"use client";

import { useState, useTransition } from "react";
import type { Database } from "@/lib/database.types";
import {
  nextOrderStatuses,
  ORDER_STATUS_LABELS,
  type OrderStatus,
} from "@/lib/admin";
import { updateOrderStatus } from "@/app/admin/orders/actions";

type Order = Database["public"]["Tables"]["orders"]["Row"];
interface LineItem { product_id: string; name: string; price_kes: number; qty: number; }

const STATUS_COLORS: Record<OrderStatus, { bg: string; fg: string }> = {
  pending_payment: { bg: "#FBF0E2", fg: "#8a5a12" },
  paid: { bg: "#E8F0E6", fg: "#3f6b3a" },
  fulfilled: { bg: "#E6ECF2", fg: "#3a5a7b" },
  cancelled: { bg: "#F3E6E6", fg: "#9b2c2c" },
};

export default function OrderCard({ order }: { order: Order }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const status = order.status as OrderStatus;
  const items = (Array.isArray(order.items) ? order.items : []) as unknown as LineItem[];
  const transitions = nextOrderStatuses(status);
  const color = STATUS_COLORS[status] ?? STATUS_COLORS.pending_payment;
  const created = new Date(order.created_at).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });

  function move(to: OrderStatus) {
    setError(null);
    startTransition(async () => {
      const res = await updateOrderStatus(order.id, status, to);
      if (!res.ok) setError(res.error ?? "Update failed.");
    });
  }

  return (
    <li className="surface-card p-5 md:p-6" style={{ opacity: pending ? 0.6 : 1 }}>
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="font-serif text-plum text-lg">#{order.id.slice(0, 8)}</span>
            <span className="font-sans text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full" style={{ background: color.bg, color: color.fg }}>
              {ORDER_STATUS_LABELS[status] ?? status}
            </span>
          </div>
          <p className="font-sans text-xs text-plum-soft mt-1">{created}</p>
        </div>
        <p className="font-serif text-plum text-2xl">KES {order.total_kes.toLocaleString()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Customer */}
        <div>
          <h3 className="eyebrow mb-2">Customer</h3>
          <p className="font-sans text-sm text-plum">{order.customer_name}</p>
          <p className="font-sans text-sm text-plum-soft">
            <a href={`tel:${order.phone}`} className="no-underline hover:text-plum transition-colors">{order.phone}</a>
          </p>
          <p className="font-sans text-sm text-plum-soft mt-1 capitalize">
            {order.delivery_method}{order.address ? ` · ${order.address}` : ""}
          </p>
          {order.notes && <p className="font-sans text-sm text-plum-soft mt-1 italic">“{order.notes}”</p>}
        </div>

        {/* Items */}
        <div>
          <h3 className="eyebrow mb-2">Items</h3>
          <ul className="list-none p-0 m-0 flex flex-col gap-1">
            {items.map((it, i) => (
              <li key={`${it.product_id}-${i}`} className="flex justify-between gap-3 font-sans text-sm">
                <span className="text-plum">{it.name} <span className="text-plum-soft">× {it.qty}</span></span>
                <span className="text-plum-soft whitespace-nowrap">KES {(it.price_kes * it.qty).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && <p className="field-error mb-3" role="alert">{error}</p>}

      {/* Transitions */}
      {transitions.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-3 border-t" style={{ borderColor: "var(--line)" }}>
          <span className="font-sans text-xs text-plum-soft self-center mr-1">Mark as:</span>
          {transitions.map((to) => (
            <button
              key={to}
              type="button"
              onClick={() => move(to)}
              disabled={pending}
              className="font-sans text-xs px-3.5 py-2 rounded-full border transition-colors"
              style={{
                borderColor: to === "cancelled" ? "#d8b4b4" : "var(--plum)",
                color: to === "cancelled" ? "#9b2c2c" : "var(--plum)",
              }}
            >
              {ORDER_STATUS_LABELS[to]}
            </button>
          ))}
        </div>
      ) : (
        <p className="font-sans text-xs text-plum-soft pt-3 border-t" style={{ borderColor: "var(--line)" }}>
          This order is {ORDER_STATUS_LABELS[status].toLowerCase()} — no further changes.
        </p>
      )}
    </li>
  );
}
