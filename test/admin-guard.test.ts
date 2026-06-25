import { describe, it, expect } from "vitest";
import type { User } from "@supabase/supabase-js";
import { isAdminUser, isSuperAdminUser, getRole } from "@/lib/supabase/admin-guard";

function userWith(appMetadata: Record<string, unknown>): User {
  return {
    id: "u1",
    app_metadata: appMetadata,
    user_metadata: {},
    aud: "authenticated",
    created_at: "2026-01-01",
  } as User;
}

describe("getRole", () => {
  it("maps legacy 'admin' and 'super_admin' to super_admin", () => {
    expect(getRole(userWith({ role: "admin" }))).toBe("super_admin");
    expect(getRole(userWith({ role: "super_admin" }))).toBe("super_admin");
  });
  it("maps 'manager' to manager", () => {
    expect(getRole(userWith({ role: "manager" }))).toBe("manager");
  });
  it("is null for non-staff or unauthenticated", () => {
    expect(getRole(userWith({ role: "editor" }))).toBeNull();
    expect(getRole(userWith({}))).toBeNull();
    expect(getRole(null)).toBeNull();
  });
});

describe("isAdminUser", () => {
  it("is true for any staff role (super-admin or manager)", () => {
    expect(isAdminUser(userWith({ role: "admin" }))).toBe(true);
    expect(isAdminUser(userWith({ role: "super_admin" }))).toBe(true);
    expect(isAdminUser(userWith({ role: "manager" }))).toBe(true);
  });
  it("is false for a non-staff role or null user", () => {
    expect(isAdminUser(userWith({ role: "editor" }))).toBe(false);
    expect(isAdminUser(userWith({}))).toBe(false);
    expect(isAdminUser(null)).toBe(false);
  });
});

describe("isSuperAdminUser", () => {
  it("is true only for super-admins", () => {
    expect(isSuperAdminUser(userWith({ role: "admin" }))).toBe(true);
    expect(isSuperAdminUser(userWith({ role: "super_admin" }))).toBe(true);
  });
  it("is false for managers and non-staff", () => {
    expect(isSuperAdminUser(userWith({ role: "manager" }))).toBe(false);
    expect(isSuperAdminUser(userWith({ role: "editor" }))).toBe(false);
    expect(isSuperAdminUser(null)).toBe(false);
  });
});
