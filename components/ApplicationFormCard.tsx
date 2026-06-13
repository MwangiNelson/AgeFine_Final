"use client";

import { useState } from "react";
import { TextField, TextAreaField, SelectField } from "@/components/FormField";
import { supabase } from "@/lib/supabaseClient";
import {
  validateApplication,
  isApplicationValid,
  buildApplicationPayload,
  INTEREST_LABELS,
  type ApplicationForm,
  type ApplicationFormErrors,
  type ApplicationInterest,
} from "@/lib/careers";

/** Careers / training application form — inserts into `applications`. */
export default function ApplicationFormCard({ defaultInterest = "position" }: { defaultInterest?: ApplicationInterest }) {
  const [form, setForm] = useState<ApplicationForm>({
    name: "",
    phone: "",
    email: "",
    interest: defaultInterest,
    message: "",
  });
  const [errors, setErrors] = useState<ApplicationFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function update<K extends keyof ApplicationForm>(key: K, value: ApplicationForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validation = validateApplication(form);
    if (!isApplicationValid(validation)) {
      setErrors(validation);
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("applications").insert(buildApplicationPayload(form));
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
        <h3 className="font-serif text-plum text-2xl mb-2">Application received</h3>
        <p className="font-sans font-light text-plum-soft text-[15px] leading-relaxed">
          Thank you — our team will review your application and get back to you by phone
          or WhatsApp.
        </p>
      </div>
    );
  }

  return (
    <div className="surface-card p-6 md:p-8">
      <h2 className="font-serif text-plum text-2xl md:text-3xl mb-1">Apply now</h2>
      <p className="font-sans font-light text-plum-soft text-sm mb-6">
        Tell us a little about yourself — we review every application personally.
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {submitError && (
          <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
            {submitError}
          </div>
        )}

        <SelectField
          label="I'm applying to"
          name="interest"
          required
          value={form.interest}
          onChange={(e) => update("interest", e.target.value as ApplicationInterest)}
          error={errors.interest}
        >
          {(Object.keys(INTEREST_LABELS) as ApplicationInterest[]).map((key) => (
            <option key={key} value={key}>{INTEREST_LABELS[key]}</option>
          ))}
        </SelectField>

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
        <TextField
          label="Email (optional)"
          name="email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          error={errors.email}
        />
        <TextAreaField
          label="Tell us about yourself"
          name="message"
          placeholder="Your experience, certifications, or why you'd like to train in aesthetics…"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          error={errors.message}
        />

        <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
          {submitting ? "Sending…" : "Submit application"}
        </button>
      </form>
    </div>
  );
}
