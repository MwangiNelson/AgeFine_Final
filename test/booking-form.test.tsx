import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi } from "vitest";

const insertMock = vi.fn((payload: Record<string, unknown>) => {
  void payload;
  return Promise.resolve({ error: null });
});
vi.mock("@/lib/supabaseClient", () => ({
  supabase: { from: () => ({ insert: insertMock }) },
}));

import BookingFormCard from "@/components/BookingFormCard";

function renderForm() {
  return render(
    <BookingFormCard
      services={["HydraFacial", "Chemical peel"]}
      heading="Book a procedure"
    />
  );
}

describe("BookingFormCard", () => {
  it("blocks submission and shows errors when required fields are empty", async () => {
    insertMock.mockClear();
    renderForm();
    fireEvent.click(screen.getByRole("button", { name: /request booking/i }));
    expect(await screen.findByText(/please enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
    expect(insertMock).not.toHaveBeenCalled();
  });

  it("submits a valid booking and shows confirmation", async () => {
    insertMock.mockClear();
    renderForm();
    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Asha Mwangi" } });
    fireEvent.change(screen.getByLabelText(/phone number/i), { target: { value: "0712345678" } });
    fireEvent.click(screen.getByRole("button", { name: /request booking/i }));

    await waitFor(() => expect(insertMock).toHaveBeenCalledTimes(1));
    expect(await screen.findByText(/booking requested/i)).toBeInTheDocument();

    // Payload matches RLS rules (name, phone, service all present)
    const payload = insertMock.mock.calls[0][0];
    expect(payload.name).toBe("Asha Mwangi");
    expect(payload.phone).toBe("0712345678");
    expect(payload.service).toBe("HydraFacial");
    expect(payload.status).toBe("new");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = renderForm();
    expect(await axe(container)).toHaveNoViolations();
  });
});
