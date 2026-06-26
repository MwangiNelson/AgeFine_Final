"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TextField } from "@/components/FormField";

type Phase = "verifying" | "ready" | "invalid";

/**
 * Landing page for the Supabase invite link. The browser client exchanges the
 * token in the URL for a session automatically (detectSessionInUrl); once that
 * lands we let the new member choose their password and send them to the
 * dashboard. Reached before any session cookie exists, so it's exempt from the
 * admin guard in middleware.
 */
export default function AcceptInvitePage() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("verifying");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let settled = false;
    const ready = () => {
      if (!settled) {
        settled = true;
        setPhase("ready");
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) ready();
    });
    // Cover the case where the session was already established on init.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) ready();
    });
    // If no session materialises, the link was invalid or has expired.
    const timer = setTimeout(() => {
      if (!settled) setPhase("invalid");
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setSubmitting(false);
      setError(updateError.message);
      return;
    }
    router.replace("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="no-underline">
            <span className="block font-serif font-medium text-2xl tracking-[0.16em]"><span className="text-brand-blue">AGE</span><span className="text-brand-pink">FINE</span></span>
            <span className="block eyebrow mt-1.5">admin</span>
          </Link>
        </div>

        <div className="surface-card p-7 md:p-9">
          {phase === "verifying" && (
            <div className="flex flex-col items-center text-center gap-4 py-6">
              <span className="btn-spinner !w-7 !h-7 text-plum-soft" aria-hidden="true" />
              <p className="font-sans text-sm text-plum-soft">Verifying your invitation…</p>
            </div>
          )}

          {phase === "invalid" && (
            <div className="text-center">
              <h1 className="font-serif text-plum text-2xl mb-2">This link didn&rsquo;t work</h1>
              <p className="font-sans font-light text-plum-soft text-sm mb-6">
                Your invitation may have expired or already been used. Ask a super-admin to send a fresh invite.
              </p>
              <Link href="/admin/login" className="btn btn-primary">Go to sign in</Link>
            </div>
          )}

          {phase === "ready" && (
            <>
              <p className="eyebrow mb-1.5">Welcome to the team</p>
              <h1 className="font-serif text-plum text-3xl mb-1">Set your password</h1>
              <p className="font-sans font-light text-plum-soft text-sm mb-6">
                Choose a password to finish setting up your admin account.
              </p>

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
                {error && (
                  <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "var(--danger-tint)", color: "var(--danger)" }}>
                    {error}
                  </div>
                )}
                <TextField
                  label="New password"
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  hint="At least 8 characters."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                  label="Confirm password"
                  name="confirm"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
                <button type="submit" className="btn btn-primary w-full" disabled={submitting} aria-busy={submitting}>
                  {submitting ? <><span className="btn-spinner" aria-hidden="true" />Saving…</> : "Save & enter dashboard"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
