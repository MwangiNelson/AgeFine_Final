"use client";

import { useState } from "react";
import { TextField, TextAreaField, SelectField } from "@/components/FormField";
import BookingCalendar from "@/components/BookingCalendar";
import { formatSlot } from "@/lib/booking";
import { supabase } from "@/lib/supabaseClient";
import {
  validateBooking,
  isBookingValid,
  buildBookingPayload,
  type BookingForm,
  type BookingErrors,
} from "@/lib/checkout";

interface Props {
  /** Service options for the dropdown. */
  services: string[];
  /** Pre-selected / fixed service (used by the contact form). */
  fixedService?: string;
  heading: string;
  intro?: string;
  submitLabel?: string;
  successMessage?: string;
}

export default function BookingFormCard({
  services,
  fixedService,
  heading,
  intro,
  submitLabel = "Request booking",
  successMessage = "Thank you — we'll be in touch shortly to confirm your booking.",
}: Props) {
  const [form, setForm] = useState<BookingForm>({
    name: "",
    phone: "",
    service: fixedService ?? services[0] ?? "",
    preferred_date: "",
    preferred_time: "",
    message: "",
  });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateBooking(form);
    if (!isBookingValid(validation)) {
      setErrors(validation);
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("bookings").insert(buildBookingPayload(form));
    setSubmitting(false);

    if (error) {
      setSubmitError("Something went wrong. Please try again, or reach us on WhatsApp.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="surface-card p-8 md:p-10 text-center">
        <div className="mx-auto w-14 h-14 rounded-full flex items-center justify-center mb-5" style={{ background: "var(--cream)" }} aria-hidden="true">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.6"><path d="M5 12l5 5L20 7" /></svg>
        </div>
        <h3 className="font-serif text-plum text-2xl mb-2">Booking requested</h3>
        <p className="font-sans font-light text-plum-soft text-[15px] leading-relaxed">{successMessage}</p>
        {form.preferred_date && (
          <p className="font-sans text-plum text-sm mt-3 mb-0">
            Requested: {form.preferred_date}
            {form.preferred_time ? ` · ${formatSlot(form.preferred_time)}` : ""}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="surface-card p-6 md:p-8">
      <h2 className="font-serif text-plum text-2xl md:text-3xl mb-1">{heading}</h2>
      {intro && <p className="font-sans font-light text-plum-soft text-sm mb-6">{intro}</p>}

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 mt-5">
        {submitError && (
          <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
            {submitError}
          </div>
        )}

        <TextField
          label="Full name"
          name="name"
          required
          autoComplete="name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          error={errors.name}
        />
        <TextField
          label="Phone number"
          name="phone"
          type="tel"
          required
          inputMode="tel"
          autoComplete="tel"
          placeholder="07XX XXX XXX"
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          error={errors.phone}
        />

        {!fixedService && (
          <SelectField
            label="Service"
            name="service"
            required
            value={form.service}
            onChange={(e) => update("service", e.target.value)}
            error={errors.service}
          >
            {services.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </SelectField>
        )}

        <BookingCalendar
          date={form.preferred_date ?? ""}
          time={form.preferred_time ?? ""}
          onSelectDate={(iso) => {
            update("preferred_date", iso);
            if (!iso) update("preferred_time", "");
          }}
          onSelectTime={(slot) => update("preferred_time", slot)}
          error={errors.preferred_date ?? errors.preferred_time}
        />

        <TextAreaField
          label={fixedService ? "Message" : "Anything else? (optional)"}
          name="message"
          placeholder={fixedService ? "How can we help?" : "Tell us about your skin goals…"}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
        />

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? "Sending…" : submitLabel}
        </button>
      </form>
    </div>
  );
}
