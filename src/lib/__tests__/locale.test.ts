import { describe, it, expect } from "vitest";
import { resolveLocale, isSupportedLocale, SUPPORTED_LOCALES } from "@/lib/locale";

describe("resolveLocale", () => {
  it("returns 'ru' when cookie is not set", () => {
    expect(resolveLocale(undefined)).toBe("ru");
  });

  it("returns 'ru' when cookie is not provided", () => {
    expect(resolveLocale()).toBe("ru");
  });

  it("returns cookie value when valid", () => {
    expect(resolveLocale("en")).toBe("en");
    expect(resolveLocale("ru")).toBe("ru");
  });

  it("falls back to 'ru' for invalid locale values", () => {
    expect(resolveLocale("fr")).toBe("ru");
    expect(resolveLocale("de")).toBe("ru");
    expect(resolveLocale("invalid")).toBe("ru");
  });
});

describe("isSupportedLocale", () => {
  it("returns true for 'ru'", () => {
    expect(isSupportedLocale("ru")).toBe(true);
  });

  it("returns true for 'en'", () => {
    expect(isSupportedLocale("en")).toBe(true);
  });

  it("returns false for unsupported locales", () => {
    expect(isSupportedLocale("fr")).toBe(false);
    expect(isSupportedLocale("de")).toBe(false);
    expect(isSupportedLocale("")).toBe(false);
  });
});

describe("SUPPORTED_LOCALES", () => {
  it("contains ru and en", () => {
    expect(SUPPORTED_LOCALES).toEqual(["ru", "en"]);
  });
});
