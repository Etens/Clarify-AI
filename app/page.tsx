"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "ai/react";
import { useSession, signIn } from 'next-auth/react';
import axios from "axios";
import Link from 'next/link';
import ResultView from "@/components/results/result-view";
import ClearButton from "@/components/button/clear-button";
import { Input } from "@/components/common/searchbar";
import { Button } from "@/components/button/button";
import { Progress } from "@/components/common/loader";
import { ParamsManager } from "@/components/user/params-manager";
import { useI18n } from '@/locales/client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/common/select";
import { Compass as DiscoverIcon } from 'lucide-react';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [style, setStyle] = useState("rafiki");
  const [userPrompt, setUserPrompt] = useState("");
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const { data: session } = useSession();
  const [progressValue, setProgressValue] = useState(0);
  const t = useI18n();
  const language = session?.user?.language;

  useEffect(() => {
    const fetchDiagrams = async () => {
      if (session) {
        try {
          const response = await axios.get('/api/diagrams', {
            params: { email: session.user?.email }
          });
          const filteredDiagrams = response.data.map((diagram: any) => ({ ...diagram.content, id: diagram.id }));
          setDiagrams(filteredDiagrams);
          console.log("Diagrams fetched successfully", filteredDiagrams);
        } catch (error) {
          console.error("Error fetching diagrams:", error);
        }
      } else {
        console.log("No session found");
      }
    };

    fetchDiagrams();
  }, [session]);

  useEffect(() => {
    let intervalId;
    if (isLoading && progressValue < 90) {
      setProgressValue(1);
      intervalId = setInterval(() => {
        setProgressValue((oldValue) => {
          const randomChoice = Math.random();
          let randomIncrease;
          if (randomChoice < 0.8) {
            randomIncrease = Math.floor(Math.random() * (15 - 5 + 1)) + 5;
          } else {
            randomIncrease = Math.floor(Math.random() * (25 - 16 + 1)) + 16;
          }
          const newValue = oldValue + randomIncrease;
          return newValue > 90 ? 90 : newValue;
        });
      }, 400);
    } else {
      setProgressValue(100);
      setTimeout(() => setProgressValue(0), 1000);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const userMessage = messages.filter((message) => message.role === "user").pop()?.content;
      if (userMessage) {
        setUserPrompt(userMessage);
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (userPrompt) {
      const assistantMessages = messages.filter((message) => message.role === "assistant");

      const filteredAndParsedMessages = assistantMessages
        .map((assistantMessage) => {
          const cleanedContent = assistantMessage.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          try {
            return JSON.parse(cleanedContent);
          } catch (error) {
            console.error("Erreur lors du parsing du contenu du message de l'assistant:", error);
            return null;
          }
        })
        .filter((content) => content !== null);

      if (filteredAndParsedMessages.length > 0) {
        console.log("Messages filtrés et parsés :", filteredAndParsedMessages);

        const newDiagram = { ...filteredAndParsedMessages[filteredAndParsedMessages.length - 1], userPrompt };

        fetchIllustrations(newDiagram, filteredAndParsedMessages);
      }
    }
  }, [userPrompt]);

  const fetchIllustrations = async (newDiagram: any, parsedMessages: any[]) => {
    console.log("Début de fetchIllustrations");

    const latestDiagram = newDiagram;
    const elements = latestDiagram?.elements;

    if (!elements) {
      console.error("Aucun élément trouvé dans le JSON.");
      return;
    }

    const illustrationPromises = elements.map(async (element: any) => {
      const keywords = element.Keywords.split(", ").map((keyword: string) => keyword.trim());
      for (let keyword of keywords) {
        const url = `/api/illustrations?keyword=${keyword}&style=${style}`;
        console.log(`Requête pour le mot-clé ${keyword} à l'URL : ${url}`);
        try {
          const response = await axios.get(url);
          if (response.status === 200 && response.data) {
            return { element: element.ElementName, url: response.data };
          }
        } catch (error) {
          console.error("Erreur lors de la requête pour le mot-clé:", keyword, error);
        }
      }
      return { element: element.ElementName, url: null };
    });

    const illustrationResults = await Promise.all(illustrationPromises);

    const newIllustrationLinks = illustrationResults.reduce((acc, curr) => {
      if (curr.url) {
        acc[curr.element] = curr.url;
      }
      return acc;
    }, {});

    const updatedDiagram = { ...newDiagram, illustrationLinks: newIllustrationLinks };
    const updatedHistory = [...diagrams, updatedDiagram];
    setDiagrams(updatedHistory);
    saveDiagram(updatedDiagram);
  };

  const saveDiagram = async (diagram: any) => {
    try {
      const url = `/api/diagrams?content=${encodeURIComponent(JSON.stringify(diagram))}&isPublished=${diagram.isPublished}`;
      const response = await axios.post(url);
      if (response.status === 200) {
        console.log("Diagram saved successfully", response.data);
        setDiagrams(prevDiagrams => prevDiagrams.map(d => d === diagram ? { ...diagram, id: response.data.id } : d));
      } else {
        console.error("Failed to save diagram");
      }
    } catch (error) {
      console.error('An error occurred while saving diagram:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Progress className="w-1/2" value={progressValue} />
      </div>
    );
  }

  const handleStyleChange = (value: string) => {
    setStyle(value);
    console.log("Style sélectionné :", value);
  };

  return (
    <main className="min-h-screen text-white">
      <header className="flex justify-end p-4 space-x-4">
        {session ? (
          <>
            <div className="flex items-center justify-center space-x-4">
              <Link href={`/${language}/discover`}>
                <Button variant="secondary">
                  <DiscoverIcon className="h-5 w-5 mr-2" />
                  {t('discover.discover')}
                </Button>
              </Link>
              <ParamsManager />
            </div>
          </>
        ) : (
          <Button onClick={() => signIn()} variant="secondary">
            {t('home.loginPrompt')}
          </Button>
        )}
      </header>

      {session ? (
        <div className="flex flex-col items-center">
          {isLoading ? (
            <div className="flex items-center justify-center h-screen bg-black">
              <Progress className="w-1/2" value={50} />
            </div>
          ) : (
            <>
              <section className="flex items-center flex-col mt-24 lg:justify-center">
                <div className="flex flex-col items-center">
                  <form className="flex flex-col items-center mt-20 p-10 md:mt-0 md:w-60 md:p-0" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-center space-x-4">
                      <Input type="text" value={input} onChange={handleInputChange} placeholder={t('home.createPrompt')} className="w-96" />
                      <Button type="submit" className="w-24" variant="secondary">
                        {t('home.createPrompt')}
                      </Button>
                    </div>
                    <div className="flex items-center justify-center mt-4 space-x-4">
                      <Select onValueChange={handleStyleChange}>
                        <SelectTrigger className="bg-primary p-2 rounded text-white w-24">
                          <SelectValue placeholder="Style" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Style</SelectLabel>
                            <SelectItem value="rafiki">Rafiki</SelectItem>
                            <SelectItem value="bro">Bro</SelectItem>
                            <SelectItem value="amico">Amico</SelectItem>
                            <SelectItem value="pana">Pana</SelectItem>
                            <SelectItem value="cuate">Cuate</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <ClearButton setDiagrams={setDiagrams} />
                    </div>
                  </form>
                </div>
              </section>
              <section className="flex flex-col items-center justify-center w-full p-0">
                <div className="flex items-center">
                  <div className="flex overflow-x-auto flex-col items-center justify-center w-full">
                    {diagrams.map((diagram, index) => (
                      <div key={index} className="relative transform w-full scale-[0.8]">
                        <ResultView
                          id={diagram.id}
                          userPrompt={diagram.userPrompt}
                          elements={diagram.elements || []}
                          illustrationLinks={diagram.illustrationLinks}
                          diagrams={diagrams}
                          setDiagrams={setDiagrams}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen bg-black">
        </div>
      )}
    </main>
  );
}
