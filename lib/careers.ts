/* ============================================================
   Careers / training application logic — pure, unit-testable.

   Validation MUST mirror the Supabase RLS WITH CHECK on the
   `applications` table:
     - name:     1..200 chars
     - phone:    5..20 chars
     - interest: 'position' | 'training'
     - email:    null or <= 200 chars
     - message:  null or <= 2000 chars
     - status:   'new' on insert
   ============================================================ */

export type ApplicationInterest = "position" | "training";

export interface ApplicationForm {
  name: string;
  phone: string;
  email?: string;
  interest: ApplicationInterest;
  message?: string;
}

export type ApplicationFormErrors = Partial<Record<keyof ApplicationForm, string>>;

function normalizePhone(phone: string): string {
  return phone.replace(/[\s-]/g, "").trim();
}

export function validateApplication(form: ApplicationForm): ApplicationFormErrors {
  const errors: ApplicationFormErrors = {};

  const name = form.name?.trim() ?? "";
  if (name.length < 1) errors.name = "Please enter your name.";
  else if (name.length > 200) errors.name = "Name is too long.";

  const phone = normalizePhone(form.phone ?? "");
  if (phone.length < 5) errors.phone = "Please enter a valid phone number.";
  else if (phone.length > 20) errors.phone = "Phone number is too long.";
  else if (!/^\+?\d+$/.test(phone)) errors.phone = "Phone number can only contain digits.";

  const email = (form.email ?? "").trim();
  if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    errors.email = "Please enter a valid email address.";
  }

  if (form.interest !== "position" && form.interest !== "training") {
    errors.interest = "Choose what you're applying for.";
  }

  if ((form.message ?? "").trim().length > 2000) {
    errors.message = "Message is too long (2000 characters max).";
  }

  return errors;
}

export function isApplicationValid(errors: ApplicationFormErrors): boolean {
  return Object.keys(errors).length === 0;
}

/** Build the row to insert into `applications`, normalizing empties to null. */
export function buildApplicationPayload(form: ApplicationForm) {
  const email = (form.email ?? "").trim();
  const message = (form.message ?? "").trim();
  return {
    name: form.name.trim(),
    phone: normalizePhone(form.phone),
    email: email || null,
    interest: form.interest,
    message: message || null,
    status: "new",
  };
}

export const INTEREST_LABELS: Record<ApplicationInterest, string> = {
  position: "Join the team",
  training: "Train with us",
};
