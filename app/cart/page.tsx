"use client";

import Link from "next/link";
import SiteShell from "@/components/SiteShell";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { items, setQty, removeItem, total } = useCart();

  return (
    <SiteShell showFooter={false}>
      <div className="mx-auto px-6 md:px-8 pt-12 md:pt-20 pb-20 md:pb-28" style={{ maxWidth: "var(--container)" }}>
        <header className="mb-8 md:mb-12">
          <p className="eyebrow mb-3" style={{ color: "var(--brand-pink-deep)" }}>Your selection</p>
          <h1 className="section-title text-[40px] md:text-[56px]">Shopping bag</h1>
        </header>

        {items.length === 0 ? (
          <div className="surface-card text-center px-6 py-16 md:py-24 max-w-[560px] mx-auto">
            <p className="font-serif italic text-plum text-2xl md:text-3xl">Your bag is empty.</p>
            <p className="font-sans font-light text-plum-soft mt-3 mb-8 text-sm md:text-base">
              Discover skincare crafted for your glow.
            </p>
            <Link href="/shop" className="btn btn-primary">Browse the collection</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 lg:gap-14 items-start">
            {/* Items */}
            <ul className="list-none p-0 m-0 flex flex-col">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 md:gap-6 py-6 border-b first:pt-0"
                  style={{ borderColor: "var(--line)" }}
                >
                  {/* Thumbnail */}
                  <Link
                    href={`/shop/${item.slug}`}
                    className="flex-none w-20 h-24 md:w-24 md:h-28 rounded-lg overflow-hidden block"
                    style={{
                      backgroundColor: "var(--blush)",
                      backgroundImage: item.image ? `url(${item.image})` : "linear-gradient(150deg,#F3E0DE,#D7A9A2)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                    aria-label={item.name}
                  />

                  {/* Detail */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/shop/${item.slug}`} className="font-serif text-plum text-lg md:text-xl no-underline hover:text-brand-blue transition-colors block leading-tight">
                          {item.name}
                        </Link>
                        <p className="font-sans text-plum-soft text-sm mt-1">
                          KES {item.price_kes.toLocaleString()}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name} from bag`}
                        className="flex-none flex items-center justify-center w-11 h-11 -mr-1.5 text-plum-soft hover:text-brand-pink-deep transition-colors"
                      >
                        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13h10l1-13" />
                        </svg>
                      </button>
                    </div>

                    {/* Qty stepper + line total */}
                    <div className="flex items-center justify-between mt-4">
                      <div
                        className="inline-flex items-center rounded-full border"
                        style={{ borderColor: "var(--line)" }}
                      >
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty - 1)}
                          aria-label={`Decrease quantity of ${item.name}`}
                          className="flex items-center justify-center w-11 h-11 text-plum disabled:opacity-40"
                        >
                          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>
                        </button>
                        <span className="w-9 text-center font-sans text-sm tabular-nums" aria-live="polite" aria-label={`Quantity ${item.qty}`}>
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQty(item.id, item.qty + 1)}
                          aria-label={`Increase quantity of ${item.name}`}
                          className="flex items-center justify-center w-11 h-11 text-plum"
                        >
                          <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                      </div>
                      <span className="font-sans text-plum text-sm md:text-base font-medium">
                        KES {(item.price_kes * item.qty).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            {/* Summary */}
            <aside
              aria-label="Order summary"
              className="surface-card p-6 md:p-7 lg:sticky lg:top-28"
            >
              <h2 className="font-serif text-plum text-2xl mb-5">Summary</h2>
              <dl className="flex flex-col gap-3 font-sans text-sm">
                <div className="flex justify-between text-plum-soft">
                  <dt>Subtotal</dt>
                  <dd>KES {total.toLocaleString()}</dd>
                </div>
                <div className="flex justify-between text-plum-soft">
                  <dt>Delivery</dt>
                  <dd>Calculated at checkout</dd>
                </div>
                <div className="flex justify-between text-plum text-base font-medium pt-4 mt-1 border-t" style={{ borderColor: "var(--line)" }}>
                  <dt>Total</dt>
                  <dd>KES {total.toLocaleString()}</dd>
                </div>
              </dl>
              <Link href="/checkout" className="btn btn-primary w-full mt-6">
                Proceed to checkout
              </Link>
              <Link href="/shop" className="block text-center font-sans text-xs tracking-[0.12em] uppercase text-gold-text no-underline mt-4 hover:text-plum transition-colors">
                Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </SiteShell>
  );
}
