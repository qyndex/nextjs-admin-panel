import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Users } from "lucide-react";
import { StatsCard } from "../StatsCard";

describe("StatsCard", () => {
  const baseProps = {
    title: "Total Users",
    value: "2,420",
    icon: Users,
    change: "+12%",
  };

  it("renders the title and value", () => {
    render(<StatsCard {...baseProps} />);
    expect(screen.getByText("Total Users")).toBeInTheDocument();
    expect(screen.getByText("2,420")).toBeInTheDocument();
  });

  it("renders change text with 'from last month' suffix", () => {
    render(<StatsCard {...baseProps} />);
    expect(screen.getByText("+12% from last month")).toBeInTheDocument();
  });

  it("applies green colour class for positive change", () => {
    render(<StatsCard {...baseProps} change="+12%" />);
    const changeEl = screen.getByText("+12% from last month");
    expect(changeEl).toHaveClass("text-green-600");
  });

  it("applies red colour class for negative change", () => {
    render(<StatsCard {...baseProps} change="-5%" />);
    const changeEl = screen.getByText("-5% from last month");
    expect(changeEl).toHaveClass("text-red-600");
  });

  it("renders the Lucide icon element", () => {
    const { container } = render(<StatsCard {...baseProps} />);
    // lucide-react renders an <svg> element
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
