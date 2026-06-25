import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/lib/database.types";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const anonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.SUPABASE_PUBLISHABLE_KEY ??
  "";

/** Returns true when the user carries any staff role in app_metadata. */
function isAdmin(appMetadata: Record<string, unknown> | undefined): boolean {
  return appMetadata?.role === "admin" || appMetadata?.role === "super_admin" || appMetadata?.role === "manager";
}

/**
 * Refreshes the auth session on every request and guards the /admin area.
 * - Unauthenticated or non-admin users hitting /admin (except /admin/login)
 *   are redirected to /admin/login.
 * - Authenticated admins hitting /admin/login are sent to the dashboard.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: getUser() revalidates the token with the auth server.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminArea = pathname.startsWith("/admin");
  const isLoginPage = pathname === "/admin/login";
  // The invite-acceptance page is reached before a session cookie exists (the
  // token arrives in the URL and is exchanged client-side), so it can't be
  // gated on `admin` — treat it as public like the login page.
  const isPublicAdminPath = isLoginPage || pathname === "/admin/accept-invite";
  const admin = user ? isAdmin(user.app_metadata) : false;

  if (isAdminArea && !isPublicAdminPath && !admin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin/login";
    redirectUrl.searchParams.set("redirectedFrom", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (isLoginPage && admin) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/admin";
    redirectUrl.searchParams.delete("redirectedFrom");
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}
