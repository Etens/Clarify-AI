"use client";

import { I18nProviderClient } from '@/locales/client';
import { useSession } from 'next-auth/react';
import { ReactNode } from 'react';

export default function I18nProviderWrapper({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return null;
  }

  const locale = session?.user?.language || 'en';

  return (
    <I18nProviderClient locale={locale}>
      {children}
    </I18nProviderClient>
  );
}
