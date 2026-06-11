import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Run on /admin routes only; skip Next internals and static assets.
  matcher: ["/admin/:path*"],
};
