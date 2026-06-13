-- rls_auto_enable() is an event-trigger helper; it must not be callable
-- through the REST API (flagged by the security advisor). Event triggers
-- run as the function owner, so revoking EXECUTE is safe.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
