"use client";

import { useId } from "react";

interface BaseProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

/**
 * Accessible text/tel/email/date input with a label, optional hint, and an
 * error message wired via aria-describedby + aria-invalid.
 */
export function TextField({
  label, name, error, required, hint, type = "text", ...rest
}: BaseProps & React.InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}{required && <span aria-hidden="true" className="text-rose"> *</span>}
      </label>
      {hint && <p id={hintId} className="font-sans text-xs text-plum-soft mb-2 -mt-1">{hint}</p>}
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={[error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined}
        className="field-input"
        {...rest}
      />
      {error && <p id={errId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export function TextAreaField({
  label, name, error, required, hint, ...rest
}: BaseProps & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}{required && <span aria-hidden="true" className="text-rose"> *</span>}
      </label>
      {hint && <p id={hintId} className="font-sans text-xs text-plum-soft mb-2 -mt-1">{hint}</p>}
      <textarea
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={[error ? errId : null, hint ? hintId : null].filter(Boolean).join(" ") || undefined}
        className="field-textarea"
        {...rest}
      />
      {error && <p id={errId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

export function SelectField({
  label, name, error, required, children, ...rest
}: BaseProps & React.SelectHTMLAttributes<HTMLSelectElement>) {
  const id = useId();
  const errId = `${id}-err`;
  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label}{required && <span aria-hidden="true" className="text-rose"> *</span>}
      </label>
      <select
        id={id}
        name={name}
        required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errId : undefined}
        className="field-select"
        {...rest}
      >
        {children}
      </select>
      {error && <p id={errId} className="field-error" role="alert">{error}</p>}
    </div>
  );
}
