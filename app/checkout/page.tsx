"use client";

import { useState } from "react";
import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { TextField, TextAreaField } from "@/components/FormField";
import { useCart } from "@/lib/cart-context";
import { supabase } from "@/lib/supabaseClient";
import {
  validateCheckout,
  isCheckoutValid,
  buildOrderPayload,
  buildWhatsAppLink,
  type CheckoutForm,
  type CheckoutErrors,
  type DeliveryMethod,
} from "@/lib/checkout";
import type { CartItem } from "@/lib/cart";

const TILL = process.env.NEXT_PUBLIC_TILL_NUMBER ?? "";
const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

interface Confirmation {
  orderId: string;
  total: number;
  items: CartItem[];
  customerName: string;
}

export default function CheckoutPage() {
  const { items, total, clear } = useCart();

  const [form, setForm] = useState<CheckoutForm>({
    customer_name: "",
    phone: "",
    delivery_method: "delivery",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  function update<K extends keyof CheckoutForm>(key: K, value: CheckoutForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateCheckout(form, items.length > 0);
    if (!isCheckoutValid(validation)) {
      setErrors(validation);
      const first = document.querySelector<HTMLElement>('[aria-invalid="true"]');
      first?.focus();
      return;
    }

    setSubmitting(true);
    const payload = buildOrderPayload(form, items);
    const { data, error } = await supabase.from("orders").insert(payload).select("id").single();
    setSubmitting(false);

    if (error || !data) {
      setSubmitError("We couldn't place your order. Please check your details and try again.");
      return;
    }

    setConfirmation({
      orderId: data.id,
      total,
      items: [...items],
      customerName: form.customer_name.trim(),
    });
    clear();
  }

  /* ---------- Confirmation screen ---------- */
  if (confirmation) {
    const waLink = WHATSAPP
      ? buildWhatsAppLink({
          whatsappNumber: WHATSAPP,
          orderId: confirmation.orderId,
          items: confirmation.items,
          total: confirmation.total,
          customerName: confirmation.customerName,
          tillNumber: TILL || undefined,
        })
      : null;

    return (
      <SiteShell showFooter={false}>
        <div className="mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-20 md:pb-28" style={{ maxWidth: "640px" }}>
          <div className="surface-card p-8 md:p-12 text-center">
            <div
              className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ background: "var(--cream)" }}
              aria-hidden="true"
            >
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6">
                <path d="M5 12l5 5L20 7" />
              </svg>
            </div>
            <p className="eyebrow mb-3" style={{ color: "var(--rose)" }}>Order received</p>
            <h1 className="section-title text-[32px] md:text-[42px] mb-3">Thank you{confirmation.customerName ? `, ${confirmation.customerName.split(" ")[0]}` : ""}.</h1>
            <p className="font-sans font-light text-plum-soft text-[15px] leading-relaxed mb-2">
              Order <span className="font-medium text-plum">#{confirmation.orderId.slice(0, 8)}</span> has been placed.
            </p>

            {/* Payment instructions */}
            <div className="text-left rounded-lg p-6 my-8" style={{ background: "var(--cream)" }}>
              <h2 className="eyebrow mb-3">Complete your payment</h2>
              <p className="font-sans text-plum leading-relaxed text-[15px]">
                Pay <span className="font-medium">KES {confirmation.total.toLocaleString()}</span> via
                M-Pesa to{" "}
                {TILL ? (
                  <>Buy Goods Till <span className="font-medium">{TILL}</span></>
                ) : (
                  <span className="italic">our Buy Goods Till (number coming soon)</span>
                )}
                .
              </p>
              <p className="font-sans font-light text-plum-soft text-sm mt-3">
                Once paid, send us your confirmation on WhatsApp so we can dispatch your order.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn btn-gold w-full">
                  <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h9a4 4 0 014 4z" />
                  </svg>
                  Confirm payment on WhatsApp
                </a>
              )}
              <Link href="/shop" className="btn btn-outline w-full">Continue shopping</Link>
            </div>
          </div>
        </div>
      </SiteShell>
    );
  }

  /* ---------- Empty cart guard ---------- */
  if (items.length === 0) {
    return (
      <SiteShell showFooter={false}>
        <div className="mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-20 text-center" style={{ maxWidth: "560px" }}>
          <h1 className="section-title text-[40px] md:text-[52px] mb-4">Checkout</h1>
          <p className="font-serif italic text-plum text-2xl mb-3">Your bag is empty.</p>
          <p className="font-sans font-light text-plum-soft mb-8">Add a few products before checking out.</p>
          <Link href="/shop" className="btn btn-primary">Browse the collection</Link>
        </div>
      </SiteShell>
    );
  }

  /* ---------- Checkout form ---------- */
  return (
    <SiteShell showFooter={false}>
      <div className="mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-20 md:pb-28" style={{ maxWidth: "var(--container)" }}>
        <header className="mb-8 md:mb-12">
          <p className="eyebrow mb-3" style={{ color: "var(--rose)" }}>Almost there</p>
          <h1 className="section-title text-[40px] md:text-[56px]">Checkout</h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10 lg:gap-14 items-start">
          {/* Form */}
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
            {submitError && (
              <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
                {submitError}
              </div>
            )}

            <fieldset className="border-0 p-0 m-0 flex flex-col gap-6">
              <legend className="eyebrow mb-2">Your details</legend>
              <TextField
                label="Full name"
                name="customer_name"
                required
                autoComplete="name"
                value={form.customer_name}
                onChange={(e) => update("customer_name", e.target.value)}
                error={errors.customer_name}
              />
              <TextField
                label="Phone number"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                inputMode="tel"
                placeholder="07XX XXX XXX"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                error={errors.phone}
              />
            </fieldset>

            <fieldset className="border-0 p-0 m-0 flex flex-col gap-4">
              <legend className="eyebrow mb-2">Delivery method</legend>
              <div className="grid grid-cols-2 gap-3">
                {(["delivery", "pickup"] as DeliveryMethod[]).map((method) => {
                  const selected = form.delivery_method === method;
                  return (
                    <label
                      key={method}
                      className="cursor-pointer rounded-lg border px-4 py-4 flex items-center gap-3 transition-colors"
                      style={{
                        borderColor: selected ? "var(--plum)" : "var(--line)",
                        background: selected ? "var(--cream)" : "#fff",
                      }}
                    >
                      <input
                        type="radio"
                        name="delivery_method"
                        value={method}
                        checked={selected}
                        onChange={() => update("delivery_method", method)}
                        className="accent-[var(--plum)] w-4 h-4"
                      />
                      <span className="font-sans text-sm text-plum capitalize">{method}</span>
                    </label>
                  );
                })}
              </div>
              {errors.delivery_method && <p className="field-error" role="alert">{errors.delivery_method}</p>}

              {form.delivery_method === "delivery" && (
                <TextField
                  label="Delivery address"
                  name="address"
                  required
                  autoComplete="street-address"
                  placeholder="Estate, street, building, house no."
                  value={form.address}
                  onChange={(e) => update("address", e.target.value)}
                  error={errors.address}
                />
              )}
            </fieldset>

            <TextAreaField
              label="Order notes (optional)"
              name="notes"
              placeholder="Anything we should know?"
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
            />

            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? "Placing order…" : "Place order"}
            </button>
            <p className="font-sans font-light text-plum-soft text-xs text-center -mt-2">
              You&apos;ll receive M-Pesa payment instructions on the next screen.
            </p>
          </form>

          {/* Order summary */}
          <aside aria-label="Order summary" className="surface-card p-6 md:p-7 lg:sticky lg:top-28">
            <h2 className="font-serif text-plum text-2xl mb-5">Your order</h2>
            <ul className="list-none p-0 m-0 flex flex-col gap-4 mb-5">
              {items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 font-sans text-sm">
                  <span className="text-plum">
                    {item.name}
                    <span className="text-plum-soft"> × {item.qty}</span>
                  </span>
                  <span className="text-plum-soft whitespace-nowrap">
                    KES {(item.price_kes * item.qty).toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
            <div className="flex justify-between font-sans text-plum text-base font-medium pt-4 border-t" style={{ borderColor: "var(--line)" }}>
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
            <Link href="/cart" className="block text-center font-sans text-xs tracking-[0.12em] uppercase text-gold-text no-underline mt-5 hover:text-plum transition-colors">
              Edit bag
            </Link>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
