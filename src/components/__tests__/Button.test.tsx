import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../ui/button";

describe("Button", () => {
  it("renders children text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", () => {
    const handler = vi.fn();
    render(<Button onClick={handler}>Action</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Action" }));
    expect(handler).toHaveBeenCalledOnce();
  });

  it("is disabled when disabled prop is set", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button", { name: "Disabled" })).toBeDisabled();
  });

  it("does not fire onClick when disabled", () => {
    const handler = vi.fn();
    render(<Button disabled onClick={handler}>Disabled</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Disabled" }));
    expect(handler).not.toHaveBeenCalled();
  });

  it("applies outline variant class", () => {
    render(<Button variant="outline">Outline</Button>);
    const btn = screen.getByRole("button", { name: "Outline" });
    expect(btn.className).toContain("border");
  });

  it("applies sm size class", () => {
    render(<Button size="sm">Small</Button>);
    const btn = screen.getByRole("button", { name: "Small" });
    expect(btn.className).toContain("h-8");
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link button</a>
      </Button>
    );
    // asChild replaces <button> with <a>
    expect(screen.getByRole("link", { name: "Link button" })).toBeInTheDocument();
  });
});
