export const LOCALES = ['zh-Hant', 'zh-Hans', 'en'];
export const DEFAULT_LOCALE = 'zh-Hant';

export function isLocale(value) {
  return LOCALES.includes(value);
}

export function t(value, locale) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  return value[locale] ?? value[DEFAULT_LOCALE] ?? '';
}
