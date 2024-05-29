"use client";
import { createI18nClient } from 'next-international/client';

export const { useI18n, useScopedI18n, I18nProviderClient } = createI18nClient({
  en: () => import('./languages/en'),
  fr: () => import('./languages/fr'),
  es: () => import('./languages/es'),
  de: () => import('./languages/de'),
  it: () => import('./languages/it'),
  pt: () => import('./languages/pt'),
  zh: () => import('./languages/zh'),
  ja: () => import('./languages/ja'),
  ru: () => import('./languages/ru'),
  he: () => import('./languages/he'),
  ar: () => import('./languages/ar'),
});
