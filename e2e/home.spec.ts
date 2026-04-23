import { test, expect } from "@playwright/test";

test.describe("Admin Panel — home page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads with Dashboard heading", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Dashboard", level: 1 })).toBeVisible();
  });

  test("sidebar is visible with Admin branding", async ({ page }) => {
    await expect(page.getByRole("complementary")).toBeVisible();
    await expect(page.getByText("Admin")).toBeVisible();
  });

  test("sidebar navigation links are present", async ({ page }) => {
    await expect(page.getByRole("link", { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /users/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /settings/i })).toBeVisible();
  });

  test("stats cards are rendered", async ({ page }) => {
    await expect(page.getByText("Total Users")).toBeVisible();
    await expect(page.getByText("Total Orders")).toBeVisible();
    await expect(page.getByText("Revenue")).toBeVisible();
    await expect(page.getByText("Active Now")).toBeVisible();
  });

  test("overview chart section is visible", async ({ page }) => {
    await expect(page.getByText("Overview")).toBeVisible();
  });
});

test.describe("Admin Panel — users page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/users");
  });

  test("Users heading is visible", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Users", level: 1 })).toBeVisible();
  });

  test("Add User button is visible", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add User" })).toBeVisible();
  });

  test("data table renders column headers", async ({ page }) => {
    await expect(page.getByRole("columnheader", { name: "Name" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Email" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Role" })).toBeVisible();
    await expect(page.getByRole("columnheader", { name: "Status" })).toBeVisible();
  });

  test("data table shows seeded user rows", async ({ page }) => {
    await expect(page.getByText("Alice Johnson")).toBeVisible();
    await expect(page.getByText("alice@example.com")).toBeVisible();
  });

  test("pagination buttons are rendered", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Previous" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Next" })).toBeVisible();
  });
});
