import { createI18nServer } from 'next-international/server';

export const { getI18n, getScopedI18n, getStaticParams } = createI18nServer({
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