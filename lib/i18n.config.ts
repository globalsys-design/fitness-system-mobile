/**
 * i18n Configuration
 * Centralized locale settings and default configuration
 */

export const locales = ["pt-BR", "en-US", "es-ES"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";

export const localeLabels: Record<Locale, string> = {
  "pt-BR": "Português (Brasil)",
  "en-US": "English (United States)",
  "es-ES": "Español (España)",
};

/**
 * Get locale from string, validate against allowed locales
 */
export function getLocale(locale: string | undefined): Locale {
  if (locale && locales.includes(locale as Locale)) {
    return locale as Locale;
  }
  return defaultLocale;
}
