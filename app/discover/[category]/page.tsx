"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import PublishedCard from '@/components/results/published-card';
import { ParamsManager } from '@/components/user/params-manager';
import { Button } from "@/components/button/button";
import { useI18n } from '@/locales/client';
import axios from 'axios';
import Link from 'next/link';
import { Diagram } from 'next-auth';
import { Tag } from 'lucide-react';

export default function DiscoverCategory() {
  const { data: session, status } = useSession();
  const { category } = useParams();
  const [postedDiagrams, setPostedDiagrams] = useState<Diagram[]>([]);
  const [categorizedDiagrams, setCategorizedDiagrams] = useState<{ [key: string]: Diagram[] }>({});
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

  useEffect(() => {
    if (category && postedDiagrams.length > 0) {
      const categories: { [key: string]: Diagram[] } = {};

      postedDiagrams.forEach((diagram) => {
        const generalTag = diagram.content.tags?.general.toLowerCase() === (category as string).toLowerCase();
        const specificTag = diagram.content.tags?.specific || "General";

        if (generalTag) {
          if (!categories[specificTag]) {
            categories[specificTag] = [];
          }

          categories[specificTag].push(diagram);
        }
      });

      setCategorizedDiagrams(categories);
    }
  }, [category, postedDiagrams]);

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
        <h1 className="text-3xl font-bold mb-8">Discover {category}</h1>
        <div className="flex flex-wrap justify-center space-x-4 mb-8">
          {Object.keys(categorizedDiagrams).map((specificTag) => (
            <Link key={specificTag} href={`/discover/${encodeURIComponent(category as string)}/${encodeURIComponent(specificTag)}`}>
              <Button variant="secondary" className="flex items-center space-x-2">
                <Tag className="h-5 w-5" />
                <span>{specificTag}</span>
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex flex-col space-y-4 w-full">
          {Object.keys(categorizedDiagrams).map((specificTag) => (
            categorizedDiagrams[specificTag].map((diagram, index) => (
              <PublishedCard key={index} diagram={diagram} />
            ))
          ))}
        </div>
      </div>
    </main>
  );
}
