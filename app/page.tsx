"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import Link from "next/link";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import ProductRailCard from "@/components/ProductRailCard";
import ProcedureItem from "@/components/ProcedureItem";

const PRODUCTS = [
  { id: "1", name: "Vitamin C glow serum", price: 2400, tag: "New", gradient: "linear-gradient(150deg,#F0E2D6,#E3C7BE)" },
  { id: "2", name: "Hydra-repair moisturiser", price: 1950, gradient: "linear-gradient(150deg,#ECE7DD,#D9C4A8)" },
  { id: "3", name: "Rose clay clarifying mask", price: 1500, tag: "Bestseller", gradient: "linear-gradient(150deg,#F3E0DE,#D7A9A2)" },
  { id: "4", name: "Gentle renewal cleanser", price: 1200, gradient: "linear-gradient(150deg,#E7E9E2,#C9C2AE)" },
];

const PROCEDURES = [
  { name: "HydraFacial", description: "Deep cleanse & hydrate · 45 min" },
  { name: "Chemical peel", description: "Resurface & brighten · 30 min" },
  { name: "Microneedling", description: "Texture & firmness · 60 min" },
];

const eyebrow: React.CSSProperties = {
  fontSize: 11, letterSpacing: "0.32em", textTransform: "uppercase",
  color: "var(--gold-text)", marginBottom: 18, fontFamily: "var(--sans)",
};
const btnBase: React.CSSProperties = {
  fontFamily: "var(--sans)", fontSize: 12.5, letterSpacing: "0.12em",
  textTransform: "uppercase", fontWeight: 400, padding: "14px 22px",
  borderRadius: 2, cursor: "pointer", textDecoration: "none", display: "inline-block",
};
const sectionTitle: React.CSSProperties = {
  fontFamily: "var(--serif)", fontWeight: 500, fontSize: 30, color: "var(--plum)", lineHeight: 1,
};
const eyebrowSmall: React.CSSProperties = {
  display: "block", fontFamily: "var(--sans)", fontSize: 10, letterSpacing: "0.3em",
  textTransform: "uppercase", color: "var(--rose)", marginBottom: 8, fontWeight: 400,
};

export default function Home() {
  const { addItem } = useCart();

  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>

      <div style={{ background: "var(--plum)", color: "var(--gold-soft)", fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", textAlign: "center", padding: "8px 12px", fontFamily: "var(--sans)" }}>
        Complimentary delivery within Nairobi · Dermatologist-led care
      </div>

      <Header />

      <main id="main" style={{ paddingBottom: 80 }}>
        <section aria-labelledby="hero-h" style={{ position: "relative", padding: "54px 26px 60px", overflow: "hidden", background: "radial-gradient(120% 80% at 78% 8%, rgba(216,189,140,.30), transparent 55%), linear-gradient(168deg, var(--ivory) 0%, var(--cream) 46%, var(--blush) 118%)" }}>
          <div aria-hidden="true" style={{ position: "absolute", width: 230, height: 230, borderRadius: "50%", border: "1px solid var(--gold-soft)", top: -60, right: -70, opacity: 0.7 }} />
          <div aria-hidden="true" style={{ position: "absolute", width: 150, height: 150, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #fff, var(--blush) 70%, var(--blush-deep))", top: 34, right: 18 }} />
          <p style={eyebrow}>Skin · beauty · confidence</p>
          <h1 id="hero-h" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 50, lineHeight: 1.02, color: "var(--plum)", letterSpacing: "0.5px", maxWidth: "8ch" }}>
            Radiance, <span style={{ fontStyle: "italic", color: "var(--rose)" }}>refined.</span>
          </h1>
          <p style={{ fontWeight: 300, fontSize: 14.5, lineHeight: 1.7, color: "var(--plum-soft)", margin: "18px 0 28px", maxWidth: "30ch", fontFamily: "var(--sans)" }}>
            Clinically considered skincare and expert procedures, crafted for your natural glow.
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/shop" style={{ ...btnBase, background: "var(--plum)", color: "var(--ivory)", border: "1px solid var(--plum)" }}>Shop the collection</Link>
            <Link href="/services" style={{ ...btnBase, background: "transparent", color: "var(--plum)", border: "1px solid var(--gold)" }}>Book a procedure</Link>
          </div>
        </section>

        <section aria-label="Why Agefine" style={{ display: "flex", justifyContent: "space-around", gap: 8, padding: "18px 16px", background: "var(--ivory)", borderBottom: "0.5px solid var(--line)" }}>
          {["Cruelty free", "Dermatologist led", "Nairobi clinic"].map((t) => (
            <div key={t} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "var(--plum-soft)", fontSize: 9.5, letterSpacing: "0.14em", textTransform: "uppercase", textAlign: "center", fontFamily: "var(--sans)" }}>
              <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.3"><path d="M12 21s-7-4.6-9-9a5 5 0 019-3 5 5 0 019 3c-2 4.4-9 9-9 9z" /></svg>
              {t}
            </div>
          ))}
        </section>

        <section className="reveal" aria-labelledby="bestsellers-h" style={{ padding: "40px 22px 12px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 id="bestsellers-h" style={sectionTitle}><span style={eyebrowSmall}>Loved by clients</span>Bestsellers</h2>
            <Link href="/shop" style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--gold-text)", textDecoration: "none", borderBottom: "1px solid var(--gold-soft)", paddingBottom: 2, whiteSpace: "nowrap", fontFamily: "var(--sans)" }}>View all</Link>
          </div>
        </section>
        <div className="reveal" style={{ display: "flex", gap: 14, overflowX: "auto", padding: "4px 22px 8px" }}>
          {PRODUCTS.map((p) => <ProductRailCard key={p.id} product={p} onAdd={() => addItem({ id: p.id, slug: p.id, name: p.name, price_kes: p.price, qty: 1 })} />)}
        </div>

        <section className="reveal" aria-labelledby="procedures-h" style={{ padding: "40px 22px 4px" }}>
          <h2 id="procedures-h" style={{ ...sectionTitle, marginBottom: 12 }}><span style={eyebrowSmall}>In-clinic</span>Signature procedures</h2>
          {PROCEDURES.map((proc) => <ProcedureItem key={proc.name} procedure={proc} />)}
        </section>

        <section className="reveal" aria-label="Founder note" style={{ marginTop: 44, background: "var(--sand)", padding: "44px 26px", textAlign: "center" }}>
          <p style={{ fontFamily: "var(--serif)", fontStyle: "italic", fontSize: 26, lineHeight: 1.32, color: "var(--plum)" }}>
            &ldquo;Beauty that begins with healthy, cared-for skin.&rdquo;
          </p>
          <p style={{ fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "var(--rose)", marginTop: 18, fontFamily: "var(--sans)" }}>— Mama Mungwana, founder</p>
        </section>

        <section className="reveal" aria-labelledby="booking-h" style={{ background: "var(--plum)", color: "var(--ivory)", padding: "48px 26px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <p style={{ ...eyebrow, color: "var(--gold-soft)" }}>Visit us</p>
          <h2 id="booking-h" style={{ fontFamily: "var(--serif)", fontWeight: 500, fontSize: 34, lineHeight: 1.08, marginBottom: 14, color: "var(--ivory)" }}>Book your consultation</h2>
          <p style={{ fontWeight: 300, fontSize: 13, lineHeight: 1.7, color: "#E9D9D2", maxWidth: "30ch", margin: "0 auto 26px", fontFamily: "var(--sans)" }}>Personalised skin assessments with our specialists. Walk in radiant.</p>
          <a href="https://wa.me/" style={{ ...btnBase, background: "var(--gold)", color: "var(--plum)", border: "none", display: "inline-flex", alignItems: "center", gap: 9 }}>
            <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a4 4 0 01-4 4H8l-5 3V7a4 4 0 014-4h9a4 4 0 014 4z" /></svg>
            Chat on WhatsApp
          </a>
        </section>

        <footer style={{ background: "var(--ivory)", padding: "30px 26px 40px" }}>
          <p style={{ fontFamily: "var(--serif)", fontSize: 20, letterSpacing: "0.16em", color: "var(--plum)", textAlign: "center", margin: 0 }}>AGEFINE</p>
          <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--rose)", textAlign: "center", marginTop: 6 }}>cosmetics &amp; skin clinic</p>
          <nav aria-label="Footer" style={{ display: "flex", justifyContent: "center", gap: 18, marginTop: 20 }}>
            {[["Shop", "/shop"], ["Services", "/services"], ["About", "/about"], ["Contact", "/contact"]].map(([l, h]) => (
              <Link key={l} href={h} style={{ color: "var(--plum-soft)", fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none" }}>{l}</Link>
            ))}
          </nav>
          <p style={{ textAlign: "center", fontSize: 10, color: "var(--plum-soft)", marginTop: 22, letterSpacing: "0.06em" }}>© 2026 Agefine Cosmetics · Nairobi, Kenya</p>
        </footer>
      </main>

      <BottomNav />
    </>
  );
}
