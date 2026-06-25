"use client";

import { useState, useTransition } from "react";
import {
  nextOrderStatuses,
  isSensitiveTransition,
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/admin";
import { updateOrderStatus, confirmPayment } from "@/app/admin/orders/actions";
import type { Order, OrderStatusHistory, OrderPayment } from "@/lib/supabaseClient";

interface LineItem { product_id: string; name: string; price_kes: number; qty: number; }

const STATUS_COLORS: Record<OrderStatus, { bg: string; fg: string }> = {
  pending_payment: { bg: "#FBF0E2", fg: "#8a5a12" },
  paid: { bg: "#E8F0E6", fg: "#3f6b3a" },
  fulfilled: { bg: "#E6ECF2", fg: "#3a5a7b" },
  cancelled: { bg: "#F3E6E6", fg: "#9b2c2c" },
  refunded: { bg: "#EFEAF3", fg: "#5b3a7b" },
};

const PAYMENT_COLORS: Record<PaymentStatus, { bg: string; fg: string }> = {
  pending: { bg: "#F1EEE9", fg: "#7a6a55" },
  submitted: { bg: "#FBF0E2", fg: "#8a5a12" },
  settled: { bg: "#E8F0E6", fg: "#3f6b3a" },
  failed: { bg: "#F3E6E6", fg: "#9b2c2c" },
  refunded: { bg: "#EFEAF3", fg: "#5b3a7b" },
};

function StatusPill({ status }: { status: OrderStatus }) {
  const c = STATUS_COLORS[status] ?? STATUS_COLORS.pending_payment;
  return (
    <span className="font-sans text-[11px] tracking-[0.08em] uppercase px-2.5 py-1 rounded-full whitespace-nowrap" style={{ background: c.bg, color: c.fg }}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </span>
  );
}

function fmt(ts: string) {
  return new Date(ts).toLocaleString("en-KE", { dateStyle: "medium", timeStyle: "short" });
}

/* Colour intent of a status change, independent of permission/sensitivity:
   green moves an order toward done, red takes money back or voids it. */
type Tone = "ok" | "danger" | "neutral";
function statusTone(to: OrderStatus): Tone {
  if (to === "cancelled" || to === "refunded") return "danger";
  if (to === "paid" || to === "fulfilled") return "ok";
  return "neutral";
}
/* Soft tints for the row of choices — quiet by default, fill to full colour on
   hover. The single inline primary action keeps the solid tone for emphasis. */
const TONE_CLASS: Record<Tone, string> = { ok: "act-ok-soft", danger: "act-danger-soft", neutral: "act-neutral" };

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>
);
const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const Spinner = () => <span className="act-spinner" aria-hidden="true" />;

export default function OrderCard({
  order,
  history,
  payments,
  isSuper,
}: {
  order: Order;
  history: OrderStatusHistory[];
  payments: OrderPayment[];
  isSuper: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingTo, setPendingTo] = useState<OrderStatus | null>(null);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [mpesaCode, setMpesaCode] = useState("");
  const [mpesaMessage, setMpesaMessage] = useState("");

  const status = order.status as OrderStatus;
  const items = (Array.isArray(order.items) ? order.items : []) as unknown as LineItem[];
  const transitions = nextOrderStatuses(status).filter((to) => !isSensitiveTransition(status, to) || isSuper);
  const latestPayment = payments[payments.length - 1];
  const hasSettled = payments.some((p) => p.status === "settled");

  // The single most likely next step, surfaced inline on the collapsed row so
  // routine orders can be processed without expanding.
  const primary =
    status === "pending_payment" && !hasSettled
      ? { label: "Confirm payment", short: "Confirm", run: () => { setExpanded(true); setConfirming(true); setError(null); } }
      : status === "paid"
      ? { label: "Mark fulfilled", short: "Fulfil", run: () => run(() => updateOrderStatus(order.id, status, "fulfilled"), "primary") }
      : null;

  // `key` identifies which button fired so only that one shows a spinner.
  function run(fn: () => Promise<{ ok: boolean; error?: string }>, key: string) {
    setError(null);
    setBusyKey(key);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Action failed.");
      else { setPendingTo(null); setNote(""); setConfirming(false); setMpesaCode(""); setMpesaMessage(""); }
      setBusyKey(null);
    });
  }

  function move(to: OrderStatus) {
    if (isSensitiveTransition(status, to)) { setPendingTo(to); setError(null); return; }
    run(() => updateOrderStatus(order.id, status, to), `move:${to}`);
  }

  return (
    <li className="surface-card overflow-hidden" aria-busy={pending}>
      {/* Summary row — expand toggle + an inline primary action */}
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex-1 min-w-0 flex items-center gap-3 md:gap-4 pl-4 md:pl-5 pr-3 py-3.5 text-left bg-transparent"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"
            className="flex-none text-plum-soft transition-transform" style={{ transform: expanded ? "rotate(90deg)" : "none" }}>
            <path d="M9 6l6 6-6 6" />
          </svg>
          <span className="font-serif text-plum text-base">#{order.id.slice(0, 8)}</span>
          <span className="font-sans text-sm text-plum truncate flex-1 min-w-0">{order.customer_name}</span>
          {latestPayment && (
            <span className="hidden sm:inline-block font-sans text-[11px] px-2 py-0.5 rounded-full whitespace-nowrap"
              style={{ background: (PAYMENT_COLORS[latestPayment.status as PaymentStatus] ?? PAYMENT_COLORS.pending).bg, color: (PAYMENT_COLORS[latestPayment.status as PaymentStatus] ?? PAYMENT_COLORS.pending).fg }}>
              {PAYMENT_STATUS_LABELS[latestPayment.status as PaymentStatus] ?? latestPayment.status}
            </span>
          )}
          <StatusPill status={status} />
          <span className="font-serif text-plum text-base whitespace-nowrap">KES {order.total_kes.toLocaleString()}</span>
        </button>
        {primary && (
          <div className="flex-none pr-4 md:pr-5 pl-1">
            <button type="button" onClick={primary.run} disabled={pending} aria-busy={busyKey === "primary"} className="act act-ok act-sm">
              {busyKey === "primary" ? <Spinner /> : status === "pending_payment" ? <CheckIcon /> : <ArrowIcon />}
              <span className="hidden sm:inline">{primary.label}</span>
              <span className="sm:hidden">{primary.short}</span>
            </button>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 md:px-5 pb-5 border-t" style={{ borderColor: "var(--line)" }}>
          <p className="font-sans text-xs text-plum-soft mt-3 mb-4">Placed {fmt(order.created_at)}{order.paid_at ? ` · Paid ${fmt(order.paid_at)}` : ""}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {/* Customer */}
            <div>
              <h3 className="eyebrow mb-2">Customer</h3>
              <p className="font-sans text-sm text-plum">{order.customer_name}</p>
              <p className="font-sans text-sm text-plum-soft"><a href={`tel:${order.phone}`} className="no-underline hover:text-plum transition-colors">{order.phone}</a></p>
              <p className="font-sans text-sm text-plum-soft mt-1 capitalize">{order.delivery_method}{order.address ? ` · ${order.address}` : ""}</p>
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

          {/* Payments */}
          <div className="mb-5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <h3 className="eyebrow">Payments</h3>
              {!hasSettled && !confirming && (
                <button type="button" onClick={() => { setConfirming(true); setError(null); }} disabled={pending}
                  className="act act-ok act-sm">
                  <CheckIcon /> Confirm payment
                </button>
              )}
            </div>

            {confirming && (
              <div className="rounded-lg p-3 border mb-3" style={{ borderColor: "var(--ok)", background: "var(--ok-tint)" }}>
                <label className="field-label !mb-1.5" htmlFor={`code-${order.id}`}>
                  M-Pesa code <span className="normal-case tracking-normal text-plum-soft">— record KES {order.total_kes.toLocaleString()} as paid</span>
                </label>
                {/* Code + confirm on one line; message tucked below, compact. */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <input id={`code-${order.id}`} value={mpesaCode} onChange={(e) => setMpesaCode(e.target.value.toUpperCase())} placeholder="e.g. TGH7XK2P9Q"
                    className="field-input !min-h-0 !py-2 font-mono sm:flex-1" autoComplete="off" />
                  <button type="button" disabled={pending} aria-busy={busyKey === "confirm-payment"}
                    onClick={() => run(() => confirmPayment(order.id, { mpesaCode, mpesaMessage }), "confirm-payment")}
                    className="act act-ok flex-none">
                    {busyKey === "confirm-payment" ? <Spinner /> : <CheckIcon />} Confirm payment
                  </button>
                </div>
                <textarea id={`msg-${order.id}`} value={mpesaMessage} onChange={(e) => setMpesaMessage(e.target.value)} rows={2}
                  className="field-textarea !min-h-0 mt-2" placeholder="Optional — paste the M-Pesa confirmation SMS" />
                <button type="button" onClick={() => { setConfirming(false); setMpesaCode(""); setMpesaMessage(""); }}
                  className="act act-ghost act-sm !px-0 mt-1">Cancel</button>
              </div>
            )}

            {payments.length === 0 ? (
              <p className="font-sans text-sm text-plum-soft">No payment recorded yet.</p>
            ) : (
              <ul className="list-none p-0 m-0 flex flex-col gap-2">
                {payments.map((p) => {
                  const c = PAYMENT_COLORS[p.status as PaymentStatus] ?? PAYMENT_COLORS.pending;
                  return (
                    <li key={p.id} className="rounded-md px-3 py-2" style={{ background: "var(--ivory)" }}>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sans text-sm">
                        <span className="text-plum uppercase">{p.provider}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full" style={{ background: c.bg, color: c.fg }}>{PAYMENT_STATUS_LABELS[p.status as PaymentStatus] ?? p.status}</span>
                        <span className="text-plum-soft">KES {p.amount_kes.toLocaleString()}</span>
                        {p.mpesa_code && <span className="text-plum font-mono text-xs">{p.mpesa_code}</span>}
                        <span className="text-plum-soft text-xs ml-auto">{fmt(p.created_at)}</span>
                      </div>
                      {p.mpesa_message && <p className="font-sans text-xs text-plum-soft italic mt-1 mb-0 whitespace-pre-wrap">{p.mpesa_message}</p>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Timeline */}
          <div className="mb-5">
            <h3 className="eyebrow mb-2">History</h3>
            {history.length === 0 ? (
              <p className="font-sans text-sm text-plum-soft">No status changes yet.</p>
            ) : (
              <ol className="list-none p-0 m-0 flex flex-col gap-2.5">
                {history.map((h) => (
                  <li key={h.id} className="flex gap-3 text-sm">
                    <span className="flex-none mt-1.5 w-2 h-2 rounded-full" style={{ background: "var(--rose)" }} aria-hidden="true" />
                    <div className="min-w-0">
                      <p className="font-sans text-plum m-0">
                        {h.from_status ? `${ORDER_STATUS_LABELS[h.from_status as OrderStatus] ?? h.from_status} → ` : ""}
                        {ORDER_STATUS_LABELS[h.to_status as OrderStatus] ?? h.to_status}
                      </p>
                      <p className="font-sans text-xs text-plum-soft m-0">
                        {h.actor_type === "system" ? `system · ${h.actor_email ?? "auto"}` : h.actor_email ?? "staff"} · {fmt(h.created_at)}
                      </p>
                      {h.note && <p className="font-sans text-xs text-plum-soft italic m-0 mt-0.5">“{h.note}”</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {error && <p className="field-error mb-3" role="alert">{error}</p>}

          {/* Sensitive confirm (note required) — tone follows the target action */}
          {pendingTo ? (
            <div className="rounded-lg p-3 border" style={{ borderColor: "var(--danger)", background: "var(--danger-tint)" }}>
              <p className="font-sans text-sm text-plum mb-2">
                {ORDER_STATUS_LABELS[status]} → <strong>{ORDER_STATUS_LABELS[pendingTo]}</strong> — add a reason for the audit trail.
              </p>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="field-textarea !min-h-0 mb-2 bg-white" placeholder="Why are you reverting/refunding this order?" />
              <div className="flex items-center gap-1">
                <button type="button" disabled={pending || !note.trim()} aria-busy={busyKey === "confirm-sensitive"}
                  onClick={() => run(() => updateOrderStatus(order.id, status, pendingTo, note), "confirm-sensitive")}
                  className={`act ${TONE_CLASS[statusTone(pendingTo)]}`}>
                  {busyKey === "confirm-sensitive" && <Spinner />}
                  Confirm {ORDER_STATUS_LABELS[pendingTo].toLowerCase()}
                </button>
                <button type="button" onClick={() => { setPendingTo(null); setNote(""); }} className="act act-ghost">Cancel</button>
              </div>
            </div>
          ) : transitions.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="font-sans text-[11px] tracking-[0.08em] uppercase text-plum-soft self-center mr-1">Move to</span>
              {transitions.map((to) => {
                const busy = busyKey === `move:${to}`;
                return (
                  <button key={to} type="button" onClick={() => move(to)} disabled={pending} aria-busy={busy}
                    className={`act act-sm ${TONE_CLASS[statusTone(to)]}`}>
                    {busy && <Spinner />}
                    {ORDER_STATUS_LABELS[to]}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="font-sans text-xs text-plum-soft">No further changes available.</p>
          )}
        </div>
      )}
    </li>
  );
}
