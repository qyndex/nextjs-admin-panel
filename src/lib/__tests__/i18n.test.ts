import { describe, it, expect, beforeEach } from "vitest";
import { t, loadLocale, defaultLocale, supportedLocales } from "../i18n";

describe("i18n", () => {
  describe("constants", () => {
    it("exports 'en' as defaultLocale", () => {
      expect(defaultLocale).toBe("en");
    });

    it("supportedLocales contains 'en'", () => {
      expect(supportedLocales).toContain("en");
    });
  });

  describe("t() before loadLocale", () => {
    it("returns the key itself when no translations are loaded", () => {
      expect(t("unknown.key")).toBe("unknown.key");
    });

    it("returns fallback when provided and key is missing", () => {
      expect(t("missing.key", "My fallback")).toBe("My fallback");
    });
  });

  describe("t() after loadLocale", () => {
    beforeEach(async () => {
      await loadLocale("en");
    });

    it("resolves a known key", () => {
      // en.json contains "common.loading": "Loading..."
      expect(t("common.loading")).toBe("Loading...");
    });

    it("resolves 'common.error'", () => {
      expect(t("common.error")).toBe("Something went wrong");
    });

    it("falls back to key for unknown key after load", () => {
      expect(t("does.not.exist")).toBe("does.not.exist");
    });

    it("prefers fallback arg over key for unknown key after load", () => {
      expect(t("does.not.exist", "Override")).toBe("Override");
    });
  });
});
