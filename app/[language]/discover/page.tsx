"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { signIn, useSession } from 'next-auth/react';
import PublishedCard from '@/components/results/published-card';
import { ParamsManager } from '@/components/user/params-manager';
import { Button } from "@/components/button/button";
import { useI18n } from '@/locales/client';
import axios from 'axios';
import { Diagram } from 'next-auth';
import { LucideIcon, Tag, Home as HomeIcon } from 'lucide-react';

const Discover = () => {
  const { data: session } = useSession();
  const pathname = usePathname();
  const language = pathname.split('/')[1];
  const [postedDiagrams, setPostedDiagrams] = useState<Diagram[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: { icon: string } }>({});
  const t = useI18n();

  const loadLucideIcon = (iconName: string): LucideIcon | null => {
    try {
      const { [iconName]: Icon } = require('lucide-react');
      return Icon;
    } catch {
      return null;
    }
  };

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
  }, [language]);

  useEffect(() => {
    if (postedDiagrams.length > 0) {
      const categories: { [key: string]: { icon: string } } = {};

      postedDiagrams.forEach((diagram) => {
        const generalTag = diagram.content.tags?.general || "Uncategorized";
        const icon = diagram.content.tags?.icon || "Tag";

        if (!categories[generalTag]) {
          categories[generalTag] = { icon };
        }
      });

      setCategories(categories);
    }
  }, [postedDiagrams]);

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
            {t('home.home')}
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
          {t('discover.discover')}
        </h1>
        <div className="flex flex-wrap justify-center space-x-4 mb-8">
          {Object.keys(categories).map((generalTag) => {
            const Icon = loadLucideIcon(categories[generalTag].icon);
            return (
              <Link key={generalTag} href={`/${language}/discover/${encodeURIComponent(generalTag)}`}>
                <Button variant="secondary" className="flex items-center space-x-2">
                  {Icon ? <Icon className="h-5 w-5" /> : <Tag className="h-5 w-5" />}
                  <span>{generalTag}</span>
                </Button>
              </Link>
            );
          })}
        </div>
        <div className="flex flex-col space-y-4 w-full">
          {postedDiagrams.map((diagram, index) => (
            <PublishedCard key={index} diagram={diagram} />
          ))}
        </div>
      </div>
    </main>
  );
};

export default Discover;
