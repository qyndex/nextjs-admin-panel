import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @supabase/supabase-js before importing the module under test
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(),
    auth: { getSession: vi.fn() },
  })),
}));

describe("supabase client", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("exports getSupabaseClient function", async () => {
    const { getSupabaseClient } = await import("../supabase");
    expect(typeof getSupabaseClient).toBe("function");
    const client = getSupabaseClient();
    expect(client).toBeDefined();
    expect(client.from).toBeDefined();
  });

  it("exports createServerClient factory", async () => {
    const { createServerClient } = await import("../supabase");
    expect(typeof createServerClient).toBe("function");
    const client = createServerClient();
    expect(client).toBeDefined();
  });

  it("throws when env vars are missing", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    const { createServerClient } = await import("../supabase");
    expect(() => createServerClient()).toThrow("Missing");
  });
});
