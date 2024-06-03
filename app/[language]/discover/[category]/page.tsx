"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import PublishedCard from '@/components/results/published-card';
import { ParamsManager } from '@/components/user/params-manager';
import { Button } from "@/components/button/button";
import { useI18n } from '@/locales/client';
import axios from 'axios';
import { Diagram } from 'next-auth';
import { Home as HomeIcon } from 'lucide-react';
import Link from 'next/link';

const DiscoverCategory = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const segments = pathname.split('/');
  const language = segments[1];
  const category = segments[3];
  const [postedDiagrams, setPostedDiagrams] = useState<Diagram[]>([]);
  const [filteredDiagrams, setFilteredDiagrams] = useState<Diagram[]>([]);
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const t = useI18n();

  useEffect(() => {
    const fetchPostedDiagrams = async () => {
      try {
        console.log("🚀 Fetching posted diagrams");
        const response = await axios.get('/api/diagrams/published', {
          params: { language },
        });
        console.log("📄 Response data:", response.data);
        const diagramsWithLikes: Diagram[] = await Promise.all(response.data.map(async (diagram: Diagram) => {
          const likesResponse = await axios.get(`/api/diagrams/like?id=${diagram.id}`);
          return { ...diagram, likes: likesResponse.data.likes };
        }));
        diagramsWithLikes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const filteredDiagrams = diagramsWithLikes.filter(diagram => diagram.content.language === language);
        setPostedDiagrams(filteredDiagrams);
      } catch (error) {
        console.error("❌ Error fetching posted diagrams:", error);
      }
    };

    fetchPostedDiagrams();
  }, [session, language, category]);

  useEffect(() => {
    if (category && postedDiagrams.length > 0) {
      const decodedCategory = decodeURIComponent(category as string);

      const filtered = postedDiagrams.filter(diagram => {
        const generalTag = diagram.content.tags?.general?.toLowerCase() === decodedCategory.toLowerCase();
        return generalTag;
      });

      setFilteredDiagrams(filtered);

      const subcats = new Set<string>();
      filtered.forEach(diagram => {
        if (diagram.content.tags?.specific) {
          subcats.add(diagram.content.tags.specific);
        }
      });
      setSubcategories(Array.from(subcats));
    }
  }, [category, postedDiagrams]);

  if (!session) {
    signIn();
    return null;
  }

  return (
    <main className="min-h-screen text-white">
      <header className="flex justify-end p-4 space-x-4">
        <Link href={`/`}>
          <Button variant="secondary">
            <HomeIcon className="h-5 w-5 mr-2" />
            Accueil
          </Button>
        </Link>
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
        <h1 className="text-3xl font-bold mb-8">
          {t('discover.discover')} {decodeURIComponent(category as string)}
        </h1>
        <div className="flex flex-wrap justify-center space-x-4 mb-8">
          {subcategories.map((subcategory) => (
            <Link key={subcategory} href={`/${language}/discover/${encodeURIComponent(category)}/${encodeURIComponent(subcategory)}`}>
              <Button variant="secondary" className="flex items-center space-x-2">
                <span>{subcategory}</span>
              </Button>
            </Link>
          ))}
        </div>
        <div className="flex flex-col space-y-4 w-full">
          {filteredDiagrams.map((diagram, index) => (
            <PublishedCard key={index} diagram={diagram} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default DiscoverCategory;
