"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import PublishedCard from '@/components/results/published-card';
import { ParamsManager } from '@/components/user/params-manager';
import { Button } from "../../components/button/button";
import { useI18n } from '@/locales/client';

export default function Discover() {
  const [postedDiagrams, setPostedDiagrams] = useState<any[]>([]);
  const { data: session, status } = useSession();
  const t = useI18n();

  useEffect(() => {
    if (session?.user?.postedDiagrams) {
      console.log("🔄 Updating posted diagrams from session", session.user.postedDiagrams);
      const diagrams = Array.isArray(session.user.postedDiagrams) 
          ? session.user.postedDiagrams 
          : [];
      setPostedDiagrams(diagrams);
    }
  }, [session]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <main className="min-h-screen text-white">
      <header className="flex justify-end p-4 space-x-4">
        {session ? (
          <>
            <ParamsManager />
          </>
        ) : (
          <Button onClick={() => signIn()} variant="secondary">
            {t('home.loginPrompt')}
          </Button>
        )}
      </header>
      <div className="flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-8">Discover</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {postedDiagrams.map((diagram, index) => (
            <PublishedCard key={index} diagram={diagram} />
          ))}
        </div>
      </div>
    </main>
  );
}
