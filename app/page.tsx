"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "ai/react";
import axios from "axios";
import ResultView from "../components/results/result-view";
import { Input } from "../components/common/searchbar";
import { Button } from "../components/button/button";
import { ParamsManager } from "@/components/user/params-manager";
import { Progress } from "@/components/common/loader";
import ClearAllButton from "../components/button/clear-button";
import Cookies from 'js-cookie';
import { signOut, useSession } from 'next-auth/react';
import Login from '../components/user/login';

export default function Home() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [allMessagesReceived, setAllMessagesReceived] = useState<any[]>([]);
  const [illustrationLinks, setIllustrationLinks] = useState({});
  const [style, setStyle] = useState("rafiki");
  const [userPrompt, setUserPrompt] = useState("");
  const [diagramHistory, setDiagramHistory] = useState<any[]>([]);
  const [lastDisplayedDiagram, setLastDisplayedDiagram] = useState<any>(null);
  const { data: session } = useSession();

  useEffect(() => {
    const savedHistory = Cookies.get('diagramHistory');
    if (savedHistory) {
      setDiagramHistory(JSON.parse(savedHistory));
    }
  }, []);

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

        if (lastDisplayedDiagram) {
          const updatedHistory = [...diagramHistory, { ...lastDisplayedDiagram, userPrompt, illustrationLinks }];
          setDiagramHistory(updatedHistory);
          Cookies.set('diagramHistory', JSON.stringify(updatedHistory));
        }

        setLastDisplayedDiagram({ ...filteredAndParsedMessages[filteredAndParsedMessages.length - 1], userPrompt, illustrationLinks });

        setAllMessagesReceived(filteredAndParsedMessages);
        setIllustrationLinks({});
        fetchIllustrations(filteredAndParsedMessages);
      }
    }
  }, [messages, isLoading]);

  const fetchIllustrations = async (parsedMessages: any[]) => {
    console.log("Début de fetchIllustrations");

    const latestDiagram = parsedMessages[parsedMessages.length - 1];
    const elements = latestDiagram?.elements;

    if (!elements) {
      console.error("Aucun élément trouvé dans le JSON.");
      return;
    }

    const illustrationPromises = elements.map(async (element: any) => {
      const keywords = element.Keywords.split(", ").map((keyword: string) => keyword.trim());
      for (let keyword of keywords) {
        const url = `http://localhost:3000/api/illustrations?keyword=${keyword}&style=${style}`;
        console.log(`Requête pour le mot-clé ${keyword} à l'URL : ${url}`);
        try {
          const response = await axios.get(url);
          if (response.status === 200 && response.data) {
            return { element: element.ElementName, url: response.data };
          }
        } catch (error) {
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
  };

  function handleDeleteDiagram(index: number): void {
    const updatedHistory = diagramHistory.filter((_, i) => i !== index);
    setDiagramHistory(updatedHistory);
    Cookies.set('diagramHistory', JSON.stringify(updatedHistory));
  }

  return (
    <main>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Progress className="w-1/2" value={50} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-center min-h-screen">
            {session ? (
              <div>
                <p>Welcome, {session.user?.name}</p>
                <button
                  onClick={() => signOut()}
                  className="px-4 py-2 bg-red-500 text-white rounded"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div>
                <Login />
                <p className="flex items-center justify-center min-h-screen text-2xl text-white">
                  You are not logged in.
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-center mt-10">
            <label htmlFor="styleSelect" className="mr-4">Select Illustration Style:</label>
            <select
              id="styleSelect"
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="rafiki">Rafiki</option>
              <option value="bro">Bro</option>
              <option value="amico">Amico</option>
              <option value="pana">Pana</option>
              <option value="cuate">Cuate</option>
            </select>
          </div>
          <section className="flex items-center justify-between w-full mt-10 p-0 flex-col md:flex-row md:p-24 lg:justify-center">
            <div className="flex flex-col items-center md:mr-20">
              {allMessagesReceived.length > 0 && (
                <ResultView
                  id="main-diagram"
                  userPrompt={userPrompt}
                  elements={allMessagesReceived[allMessagesReceived.length - 1]?.elements || []}
                  illustrationLinks={illustrationLinks}
                  onCopy={() => console.log("Copy current diagram")}
                />
              )}
              <form className="flex flex-col items-center w-full mt-20 p-10 md:mt-0 md:w-60 md:p-0" onSubmit={handleSubmit}>
                <Input type="text" value={input} onChange={handleInputChange} placeholder="Create..." />
                <Button type="submit" className="mt-4">
                  Create
                </Button>
              </form>
            </div>
          </section>
          <section className="flex flex-col items-center justify-center w-full mt-10 p-0">
            <h2 className="text-xl font-semibold mb-4 text-center text-white">History</h2>
            <ClearAllButton setDiagramHistory={setDiagramHistory} />
            <div className="flex items-center">
              <div className="flex overflow-x-auto">
                {diagramHistory.map((diagram, index) => (
                  <div key={index} className="relative transform w-full scale-[0.8]">
                    <ResultView
                      id={`diagram-${index}`}
                      userPrompt={diagram.userPrompt}
                      elements={diagram.elements || []}
                      illustrationLinks={diagram.illustrationLinks}
                      onCopy={() => console.log("Copy diagram", index)}
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
        </>
      )}
    </main>
  );
}
