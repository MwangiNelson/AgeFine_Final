import { render, screen, fireEvent } from "@testing-library/react";
import { axe } from "jest-axe";
import { describe, it, expect, vi } from "vitest";
import ProductRailCard from "@/components/ProductRailCard";

const product = { id: "1", name: "Vitamin C glow serum", price: 2400, tag: "New", gradient: "#eee" };

describe("ProductRailCard", () => {
  it("renders name and formatted KES price", () => {
    render(<ProductRailCard product={product} onAdd={() => {}} />);
    expect(screen.getByText("Vitamin C glow serum")).toBeInTheDocument();
    expect(screen.getByText("KES 2,400")).toBeInTheDocument();
  });

  it("calls onAdd with product id when add is clicked", () => {
    const onAdd = vi.fn();
    render(<ProductRailCard product={product} onAdd={onAdd} />);
    fireEvent.click(screen.getByRole("button"));
    expect(onAdd).toHaveBeenCalledWith("1");
  });

  it("has no detectable accessibility violations", async () => {
    const { container } = render(<ProductRailCard product={product} onAdd={() => {}} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
