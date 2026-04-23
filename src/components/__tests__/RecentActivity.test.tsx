import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentActivity } from "../RecentActivity";
import type { AuditLogEntryWithUser } from "@/types/database";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

function makeEntry(
  overrides: Partial<AuditLogEntryWithUser> = {}
): AuditLogEntryWithUser {
  return {
    id: "test-id",
    user_id: "user-1",
    action: "user.login",
    resource_type: null,
    resource_id: null,
    details: null,
    ip_address: null,
    created_at: new Date().toISOString(),
    profiles: { full_name: "Alice", email: "alice@example.com" },
    ...overrides,
  };
}

describe("RecentActivity", () => {
  it("renders nothing when entries is empty", () => {
    const { container } = render(<RecentActivity entries={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders entry action label", () => {
    render(<RecentActivity entries={[makeEntry()]} />);
    expect(screen.getByText("Signed in")).toBeInTheDocument();
  });

  it("renders user name", () => {
    render(<RecentActivity entries={[makeEntry()]} />);
    expect(screen.getByText(/Alice/)).toBeInTheDocument();
  });

  it("renders role change action", () => {
    render(
      <RecentActivity
        entries={[makeEntry({ action: "user.role_change" })]}
      />
    );
    expect(screen.getByText("Changed role")).toBeInTheDocument();
  });

  it("shows 'View all' link to audit page", () => {
    render(<RecentActivity entries={[makeEntry()]} />);
    const link = screen.getByRole("link", { name: "View all" });
    expect(link).toHaveAttribute("href", "/admin/audit");
  });

  it("falls back to email when full_name is null", () => {
    render(
      <RecentActivity
        entries={[
          makeEntry({
            profiles: { full_name: null, email: "bob@example.com" },
          }),
        ]}
      />
    );
    expect(screen.getByText(/bob@example.com/)).toBeInTheDocument();
  });

  it("shows 'System' when profiles is null", () => {
    render(
      <RecentActivity entries={[makeEntry({ profiles: null })]} />
    );
    expect(screen.getByText(/System/)).toBeInTheDocument();
  });
});
