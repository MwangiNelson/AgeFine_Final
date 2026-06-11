import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: () => {}, refresh: () => {} }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/lib/supabase/client", () => ({ createClient: () => ({ auth: {} }) }));
vi.mock("@/lib/supabaseClient", () => ({ supabase: {} }));

import SiteFooter from "@/components/SiteFooter";
import AdminLoginPage from "@/app/admin/login/page";
import BookingFormCard from "@/components/BookingFormCard";

describe("Accessibility audit (M6)", () => {
  it("footer (with social links) has no axe violations", async () => {
    const { container } = render(<SiteFooter />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("admin login page has no axe violations", async () => {
    const { container } = render(<AdminLoginPage />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("booking form (services/contact) has no axe violations", async () => {
    const { container } = render(
      <BookingFormCard services={["HydraFacial", "Chemical peel"]} heading="Book a procedure" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("contact-style fixed-service booking form has no axe violations", async () => {
    const { container } = render(
      <BookingFormCard services={["General enquiry"]} fixedService="General enquiry" heading="Send an enquiry" />
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
