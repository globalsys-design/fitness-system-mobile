/**
 * next-intl Request Configuration
 * Used by middleware and app layout to get translations
 * 
 * Usage in components:
 * import { getTranslations } from 'next-intl/server';
 * const t = await getTranslations('namespace');
 * 
 * In client components:
 * import { useTranslations } from 'next-intl';
 * const t = useTranslations('namespace');
 */

import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./messages/${locale}.json`)).default,
}));
