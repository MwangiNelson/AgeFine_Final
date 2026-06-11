import { describe, it, expect } from "vitest";
import type { User } from "@supabase/supabase-js";
import { isAdminUser } from "@/lib/supabase/admin-guard";

function userWith(appMetadata: Record<string, unknown>): User {
  return {
    id: "u1",
    app_metadata: appMetadata,
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01",
  } as User;
}

describe("isAdminUser", () => {
  it("is true only when app_metadata.role === 'admin'", () => {
    expect(isAdminUser(userWith({ role: "admin" }))).toBe(true);
  });

  it("is false for a non-admin role", () => {
    expect(isAdminUser(userWith({ role: "editor" }))).toBe(false);
    expect(isAdminUser(userWith({}))).toBe(false);
  });

  it("is false for a null user (unauthenticated)", () => {
    expect(isAdminUser(null)).toBe(false);
  });
});
