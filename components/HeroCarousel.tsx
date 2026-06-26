"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

export interface HeroSlide {
  slug: string;
  name: string;
  tagline: string | null;
  image: string;
}

const AUTO_ADVANCE_MS = 6000;

/**
 * Landing hero: the clinic's signature procedures as a full-bleed,
 * auto-advancing carousel of their own treatment photography.
 *
 * Accessibility: pauses on hover/focus/touch and under reduced motion;
 * slides are real list items with prev/next + dot controls; the active
 * slide is announced via a polite live region.
 */
export default function HeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const reducedMotion = useRef(false);

  useEffect(() => {
    reducedMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    if (paused || reducedMotion.current || slides.length < 2) return;
    const t = setInterval(() => go(1), AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused, go, slides.length]);

  if (slides.length === 0) return null;
  const active = slides[index];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Signature procedures"
      className="relative overflow-hidden bg-plum"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        setPaused(true);
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        const start = touchX.current;
        touchX.current = null;
        if (start === null) return;
        const dx = e.changedTouches[0].clientX - start;
        if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
      }}
    >
      {/* Slides */}
      <ul className="list-none p-0 m-0 relative h-[78svh] min-h-[480px] max-h-[820px]">
        {slides.map((slide, i) => (
          <li
            key={slide.slug}
            aria-hidden={i !== index}
            className="absolute inset-0 transition-opacity duration-700 ease-in-out"
            style={{ opacity: i === index ? 1 : 0, pointerEvents: i === index ? "auto" : "none" }}
          >
            <div
              role="img"
              aria-label={`${slide.name} at Agefine`}
              className="absolute inset-0"
              style={{
                backgroundImage: `url(${slide.image})`,
                backgroundSize: "cover",
                backgroundPosition: "center 30%",
              }}
            />
            {/* Legibility scrim */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(43,27,36,0.82) 0%, rgba(43,27,36,0.35) 42%, rgba(43,27,36,0.12) 70%, rgba(43,27,36,0.25) 100%)",
              }}
            />

            {/* Copy */}
            <div className="absolute inset-x-0 bottom-0">
              <div className="mx-auto px-6 md:px-8 pb-20 md:pb-24" style={{ maxWidth: "var(--container)" }}>
                <p className="eyebrow mb-3" style={{ color: "var(--brand-pink-soft)" }}>
                  Signature procedure
                </p>
                <h2 className="font-serif font-medium leading-[1.04] text-[clamp(2.2rem,7vw,4rem)] m-0 max-w-[16ch]" style={{ color: "var(--ivory)" }}>
                  {slide.name}
                </h2>
                {slide.tagline && (
                  <p className="font-sans font-light text-[15px] md:text-lg mt-3 mb-0 max-w-[44ch]" style={{ color: "#EFDFD8" }}>
                    {slide.tagline}
                  </p>
                )}
                <div className="flex flex-wrap gap-3 mt-6">
                  <Link href={`/services/${slide.slug}`} className="btn btn-gold">
                    Explore this treatment
                  </Link>
                  <Link
                    href="/services"
                    className="btn"
                    style={{ color: "var(--ivory)", borderColor: "rgba(251,247,242,0.55)" }}
                  >
                    All treatments
                  </Link>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Controls */}
      <div className="absolute inset-x-0 bottom-0">
        <div className="mx-auto px-6 md:px-8 pb-6 flex items-center justify-between" style={{ maxWidth: "var(--container)" }}>
          {/* Dots */}
          <div role="group" aria-label="Choose slide" className="flex items-center gap-2.5">
            {slides.map((slide, i) => (
              <button
                key={slide.slug}
                type="button"
                aria-label={`Slide ${i + 1}: ${slide.name}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
                className="h-11 w-7 flex items-center justify-center"
              >
                <span
                  aria-hidden="true"
                  className="block h-[3px] w-full rounded-full transition-colors"
                  style={{ background: i === index ? "var(--brand-blue-soft)" : "rgba(251,247,242,0.35)" }}
                />
              </button>
            ))}
          </div>

          {/* Prev / next */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous procedure"
              onClick={() => go(-1)}
              className="flex items-center justify-center w-11 h-11 rounded-full border transition-colors"
              style={{ color: "var(--ivory)", borderColor: "rgba(251,247,242,0.4)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
            </button>
            <button
              type="button"
              aria-label="Next procedure"
              onClick={() => go(1)}
              className="flex items-center justify-center w-11 h-11 rounded-full border transition-colors"
              style={{ color: "var(--ivory)", borderColor: "rgba(251,247,242,0.4)" }}
            >
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </div>

      {/* Announce slide changes to screen readers */}
      <p aria-live="polite" className="sr-only">
        {active.name}, slide {index + 1} of {slides.length}
      </p>
    </section>
  );
}
