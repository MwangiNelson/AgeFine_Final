"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { TextField } from "@/components/FormField";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const supabase = createClient();
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError || !data.user) {
      setSubmitting(false);
      setError("Incorrect email or password.");
      return;
    }

    // Only staff may proceed; sign others out immediately.
    const role = data.user.app_metadata?.role;
    const isStaff = role === "admin" || role === "super_admin" || role === "manager";
    if (!isStaff) {
      await supabase.auth.signOut();
      setSubmitting(false);
      setError("This account doesn't have admin access.");
      return;
    }

    const redirectTo = searchParams.get("redirectedFrom") || "/admin";
    router.replace(redirectTo);
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12" style={{ background: "var(--cream)" }}>
      <div className="w-full max-w-[420px]">
        <div className="text-center mb-8">
          <Link href="/" className="no-underline">
            <span className="block font-serif font-medium text-2xl tracking-[0.16em] text-plum">AGEFINE</span>
            <span className="block eyebrow mt-1.5">admin</span>
          </Link>
        </div>

        <div className="surface-card p-7 md:p-9">
          <h1 className="font-serif text-plum text-3xl mb-1">Sign in</h1>
          <p className="font-sans font-light text-plum-soft text-sm mb-6">Manage products, orders and bookings.</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {error && (
              <div role="alert" className="rounded-lg px-4 py-3 font-sans text-sm" style={{ background: "#FBEAEA", color: "#9b2c2c" }}>
                {error}
              </div>
            )}
            <TextField
              label="Email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6">
          <Link href="/" className="font-sans text-xs tracking-[0.12em] uppercase text-gold-text no-underline hover:text-plum transition-colors">
            ← Back to store
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
