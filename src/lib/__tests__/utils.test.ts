import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("cn (class name utility)", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-sm")).toBe("text-sm");
  });

  it("merges multiple classes", () => {
    expect(cn("px-4", "py-2")).toBe("px-4 py-2");
  });

  it("de-duplicates conflicting Tailwind classes (last wins)", () => {
    // tailwind-merge resolves text-sm vs text-lg — last provided class wins
    expect(cn("text-sm", "text-lg")).toBe("text-lg");
  });

  it("ignores falsy values", () => {
    expect(cn("text-sm", false, undefined, null, "font-bold")).toBe(
      "text-sm font-bold"
    );
  });

  it("handles conditional object syntax from clsx", () => {
    expect(cn({ "text-red-500": true, "text-green-500": false })).toBe(
      "text-red-500"
    );
  });

  it("returns empty string when no valid classes are provided", () => {
    expect(cn(false, undefined)).toBe("");
  });
});
