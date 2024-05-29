"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "ai/react";
import axios from "axios";
import ResultView from "../components/results/result-view";
import { Input } from "../components/common/searchbar";
import { Button } from "../components/button/button";
import { Progress } from "@/components/common/loader";
import ClearAllButton from "../components/button/clear-button";
import { useSession, signIn } from 'next-auth/react';
import { ParamsManager } from "@/components/user/params-manager";
import { useI18n } from '@/locales/client';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/common/select"

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [allMessagesReceived, setAllMessagesReceived] = useState<any[]>([]);
  const [illustrationLinks, setIllustrationLinks] = useState({});
  const [style, setStyle] = useState("rafiki");
  const [userPrompt, setUserPrompt] = useState("");
  const [diagramHistory, setDiagramHistory] = useState<any[]>([]);
  const [lastDisplayedDiagram, setLastDisplayedDiagram] = useState<any>(null);
  const { data: session, status, update } = useSession();
  const t = useI18n();

  useEffect(() => {
    if (session?.user?.diagrams) {
      setDiagramHistory(session.user.diagrams);
    }
  }, [session]);

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const userMessage = messages.filter((message) => message.role === "user").pop()?.content;
      if (userMessage) {
        setUserPrompt(userMessage);
        console.log("Prompt saisi par l'utilisateur :", userMessage);
      }
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

        setLastDisplayedDiagram(newDiagram);
        setAllMessagesReceived(filteredAndParsedMessages);
        fetchIllustrations(newDiagram, filteredAndParsedMessages);
      }
    }
  }, [messages, isLoading]);

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

    setIllustrationLinks(newIllustrationLinks);

    // Ajoutez le nouveau diagramme à l'historique et sauvegardez-le après avoir récupéré les illustrations
    const updatedDiagram = { ...newDiagram, illustrationLinks: newIllustrationLinks };
    const updatedHistory = [...diagramHistory, updatedDiagram];
    setDiagramHistory(updatedHistory);
    saveDiagrams(updatedHistory);

    // Mettez à jour la session utilisateur
    update({
      ...session,
      trigger: "update",
      user: {
        ...(session?.user ?? {}),
        diagrams: updatedHistory,
      },
    });
  };

  const saveDiagrams = async (diagrams: any[]) => {
    try {
      const response = await axios.post('/api/auth/diagrams', { diagrams });
      if (response.status === 200) {
        console.log("Diagrams saved successfully");
      } else {
        console.error("Failed to save diagrams");
      }
    } catch (error) {
      console.error('An error occurred while saving diagrams:', error);
    }
  };

  function handleDeleteDiagram(index: number): void {
    const updatedHistory = diagramHistory.filter((_, i) => i !== index);
    setDiagramHistory(updatedHistory);
    saveDiagrams(updatedHistory);

    // Mettez à jour la session utilisateur
    update({
      ...session,
      trigger: "update",
      user: {
        ...(session?.user ?? {}),
        diagrams: updatedHistory,
      },
    });
  }

  useEffect(() => {
    console.log("Session updated:", session);
  }, [session]);

  if (status === "loading") {
    return <div>{t('home.loading')}</div>;
  }

  return (
    <main className="min-h-screen text-white">
      <header className="flex justify-end p-4 space-x-4">
        {session ? (
          <>
            <ParamsManager />
          </>
        ) : (
          <Button
            onClick={() => signIn()}
            variant="secondary"
          >
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
              <section className="flex flex-col items-center justify-center w-full p-0">
                <div className="flex items-center">
                  <div className="flex overflow-x-auto">
                    {diagramHistory.map((diagram, index) => (
                      <div key={index} className="relative transform w-full scale-[0.8]">
                        <ResultView
                          id={`diagram-${index}`}
                          userPrompt={diagram.userPrompt}
                          elements={diagram.elements || []}
                          illustrationLinks={diagram.illustrationLinks}
                          onCopy={() => console.log(t('home.copyDiagram'), index)}
                          onDelete={() => handleDeleteDiagram(index)}
                          diagramHistory={diagramHistory}
                          setDiagramHistory={setDiagramHistory}
                          index={index}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </section>
              <section className="flex items-center w-full flex-col mb-32 lg:justify-center">
                <div className="flex flex-col items-center w-full">
                  {allMessagesReceived.length > 0 && (
                    <ResultView
                      id="main-diagram"
                      userPrompt={userPrompt}
                      elements={allMessagesReceived[allMessagesReceived.length - 1]?.elements || []}
                      illustrationLinks={illustrationLinks}
                      onCopy={() => console.log(t('home.copyDiagram'))}
                    />
                  )}
                  <form className="flex flex-col items-center w-full mt-20 p-10 md:mt-0 md:w-60 md:p-0" onSubmit={handleSubmit}>
                    <div className="flex items-center justify-center w-full space-x-4">
                      <Input type="text" value={input} onChange={handleInputChange} placeholder={t('home.createPrompt')} className="w-96" />
                      <Button type="submit" className="w-24" variant="secondary">
                        {t('home.createPrompt')}
                      </Button>
                    </div>
                    <div className="flex items-center justify-center mt-4 space-x-4">
                      <Select>
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
                      <ClearAllButton setDiagramHistory={setDiagramHistory} />
                    </div>
                  </form>
                </div>
              </section>
            </>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen bg-black">
          <p className="text-xl font-semibold text-center">{t('home.loginPrompt')}</p>
        </div>
      )}
    </main>
  );
}
