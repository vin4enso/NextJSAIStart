export const SUPPORTED_LOCALES = ["ru", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export function resolveLocale(cookieValue?: string): Locale {
  if (cookieValue && isSupportedLocale(cookieValue)) {
    return cookieValue;
  }
  return "ru";
}
