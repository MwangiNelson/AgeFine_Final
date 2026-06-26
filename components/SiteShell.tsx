import SiteHeader from "@/components/SiteHeader";
import BottomNav from "@/components/BottomNav";
import SiteFooter from "@/components/SiteFooter";

/**
 * Page chrome shared by every route: skip link, announcement bar,
 * responsive header, the <main> landmark, footer, and the mobile-only
 * bottom tab bar. Pages render only their own content as children.
 */
export default function SiteShell({
  children,
  announcement = "Complimentary delivery within Nairobi · Dermatologist-led care",
  showFooter = true,
}: {
  children: React.ReactNode;
  announcement?: string | null;
  showFooter?: boolean;
}) {
  return (
    <>
      <a href="#main" className="skip-link">Skip to content</a>

      {announcement && (
        <div className="bg-brand-blue text-[#111111] text-[11px] tracking-[0.18em] uppercase text-center px-3 py-2 font-sans">
          {announcement}
        </div>
      )}

      <SiteHeader />

      {/* pb-24 on mobile clears the fixed bottom nav; reset on desktop */}
      <main id="main" className="pb-24 md:pb-0">
        {children}
      </main>

      {showFooter && <SiteFooter />}

      <BottomNav />
    </>
  );
}
