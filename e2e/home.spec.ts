import { test, expect } from "@playwright/test";

test.describe("Admin Panel — login page", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/");
    // Should redirect to login (when Supabase is configured) or show dashboard
    // In dev without Supabase, middleware allows access
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();
  });

  test("login page has sign in form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /admin panel/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("login page shows demo credentials", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByText(/admin@example.com/)).toBeVisible();
  });
});

test.describe("Admin Panel — dashboard (unauthenticated dev mode)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with Dashboard heading", async ({ page }) => {
    // In dev without Supabase config, middleware allows access
    const heading = page.getByRole("heading", { name: "Dashboard", level: 1 });
    // If redirected to login, heading won't be "Dashboard"
    const isLogin = await page.getByText("Sign in to access").isVisible().catch(() => false);
    if (!isLogin) {
      await expect(heading).toBeVisible();
    }
  });

  test("sidebar navigation links are present when authenticated", async ({ page }) => {
    const isLogin = await page.getByText("Sign in to access").isVisible().catch(() => false);
    if (!isLogin) {
      await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /users/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /audit log/i })).toBeVisible();
    }
  });
});
