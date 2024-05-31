"use client";

import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import PublishedCard from '@/components/results/published-card';
import { ParamsManager } from '@/components/user/params-manager';
import { Button } from "../../components/button/button";
import { useI18n } from '@/locales/client';
import axios from 'axios';

export default function Discover() {
  const { data: session, status } = useSession();
  const [postedDiagrams, setPostedDiagrams] = useState<Diagram[]>([]);
  const t = useI18n();

  useEffect(() => {
    const fetchPostedDiagrams = async () => {
      try {
        console.log("🚀 Fetching posted diagrams");
        const response = await axios.get('/api/diagrams/published');
        console.log("📄 Response data:", response.data);
        const diagramsWithLikes: Diagram[] = await Promise.all(response.data.map(async (diagram: Diagram) => {
          const likesResponse = await axios.get(`/api/diagrams/like?id=${diagram.id}`);
          return { ...diagram, likes: likesResponse.data.likes };
        }));
        setPostedDiagrams(diagramsWithLikes);
      } catch (error) {
        console.error("❌ Error fetching posted diagrams:", error);
      }
    };

    fetchPostedDiagrams();
  }, []);

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
        <div className="flex flex-col space-y-4 w-full">
          {Array.isArray(postedDiagrams) && postedDiagrams.map((diagram, index) => (
            <PublishedCard key={index} diagram={diagram} />
          ))}
        </div>
      </div>
    </main>
  );
}
