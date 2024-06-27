'use client';

import React, { useState, useEffect } from "react";
import { Message, useAssistant } from 'ai/react';
import { useSession, signIn } from 'next-auth/react';
import axios from "axios";
import Link from 'next/link';
import ClearButton from "@/components/button/clear-button";
import { Input } from "@/components/common/searchbar";
import { Button } from "@/components/button/button";
import { Progress } from "@/components/common/loader";
import { ParamsManager } from "@/components/user/params-manager";
import { useI18n } from '@/locales/client';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/common/select";
import { Compass as DiscoverIcon } from 'lucide-react';
import { CardStack } from "../components/results/card_v2";

interface ElementData {
  ElementName: string;
  Illustration: string;
  Explanation: string;
}

interface Diagram {
  id: string;
  title: string;
  elements: ElementData[];
  userPrompt?: string;
}

export default function Home() {
  const { status, messages, input, handleInputChange, error, append } = useAssistant({ api: '/api/assistant' });
  const [style, setStyle] = useState("rafiki");
  const [userPrompt, setUserPrompt] = useState("");
  const [diagrams, setDiagrams] = useState<Diagram[]>([]);
  const { data: session } = useSession();
  const [progressValue, setProgressValue] = useState(0);
  const t = useI18n();
  const language = session?.user?.language;
  const isLoading = status === 'in_progress';

  useEffect(() => {
    const fetchDiagrams = async () => {
      if (session) {
        console.log("🔄 Fetching diagrams...");
        try {
          const response = await axios.get('/api/diagrams', {
            params: { email: session.user?.email }
          });
          console.log("📦 Response:", response.data);
          const filteredDiagrams = response.data.map((diagram: any) => ({
            ...diagram.content,
            id: diagram.id,
            title: diagram.content.title,
            elements: Array.isArray(diagram.content.elements) ? diagram.content.elements : []
          }));
          setDiagrams(filteredDiagrams);
          console.log("✅ Diagrams fetched successfully", filteredDiagrams);
        } catch (error) {
          console.error("❌ Error fetching diagrams:", error);
        }
      } else {
        console.log("ℹ️ No session found");
      }
    };

    fetchDiagrams();
  }, [session]);

  const CARDS = diagrams.map((diagram, index) => ({
    id: diagram.id || `ID not available for diagram ${index + 1}`,
    name: diagram.title || `Title not available for diagram ${index + 1}`,
    content: (
      <div className="card-content px-8 flex flex-wrap justify-between">
        {diagram.elements.map((element, elemIndex) => (
          <div key={elemIndex} className="element flex flex-col items-center mb-4 w-1/2 px-4 mt-5">
            <h3 className="element-name text-sm font-bold mb-1 text-center">{element.ElementName || "Element name not available"}</h3>
            <img className="element-illustration w-full h-56 object-contain rounded-md mb-1 p-2" src={element.Illustration || ""} alt={element.ElementName} />
            <p className="element-explanation text-xs text-center">{element.Explanation || "Explanation not available"}</p>
          </div>
        ))}
      </div>
    ),
  }));

  console.log("🃏 CARDS data:", CARDS);

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
        console.log("📩 User message received:", userMessage);  // Ajout de console.log
        setUserPrompt(userMessage);
      }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (error) {
      console.error("❌ An error occurred:", error);  // Ajout de console.log
    }
  }, [error]);

  useEffect(() => {
    if (userPrompt) {
      console.log("📝 Processing user prompt:", userPrompt);  // Log processing user prompt
      const assistantMessages = messages.filter((message) => message.role === "assistant");
      console.log("📨 Assistant messages:", assistantMessages);  // Log assistant messages

      const filteredAndParsedMessages = assistantMessages
        .map((assistantMessage) => {
          const cleanedContent = assistantMessage.content
            .replace(/```json/g, "")
            .replace(/```/g, "")
            .trim();
          try {
            return JSON.parse(cleanedContent);
          } catch (error) {
            console.error("❌ Error parsing assistant message content:", error);  // Log parsing error
            return null;
          }
        })
        .filter((content) => content !== null);

      if (filteredAndParsedMessages.length > 0) {
        console.log("📄 Filtered and parsed messages:", filteredAndParsedMessages);  // Log filtered and parsed messages

        const newDiagram = { ...filteredAndParsedMessages[filteredAndParsedMessages.length - 1], userPrompt };
        const updatedHistory = [...diagrams, newDiagram];
        setDiagrams(updatedHistory);
        saveDiagram(newDiagram);
      }
    }
  }, [userPrompt]);

  const saveDiagram = async (diagram: any) => {
    console.log("💾 Saving diagram...");  // Ajout de console.log
    try {
      const url = `/api/diagrams?content=${encodeURIComponent(JSON.stringify(diagram))}&isPublished=${diagram.isPublished}`;
      const response = await axios.post(url);
      if (response.status === 200) {
        console.log("✅ Diagram saved successfully", response.data);  // Ajout de console.log
        setDiagrams(prevDiagrams => prevDiagrams.map(d => d === diagram ? { ...diagram, id: response.data.id } : d));
      } else {
        console.error("❌ Failed to save diagram");  // Ajout de console.log
      }
    } catch (error) {
      console.error('❌ An error occurred while saving diagram:', error);  // Ajout de console.log
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
    console.log("🎨 Style selected:", value);  // Ajout de console.log
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Ajouter les informations de langage et de style au prompt
    const enrichedPrompt = `${input} Please respond in ${language} for all parts of the response, except for keywords for illustrations and icon names in tags which should remain in English. Ensure that the title of the diagram, the names of elements, and the names of tags are all in ${language}. Only the keywords for illustrations and the icon names in tags should remain in English. Additionally, include the property "language" in the response JSON to indicate the language of the diagram. Also, ensure that the illustrations use the style ${style} when searching in the file and only use this style ${style}.`;

    // Utiliser `append` pour ajouter le message enrichi
    try {
      await append({ role: 'user', content: enrichedPrompt });
      console.log("📤 Submitting enriched message:", enrichedPrompt);  // Ajout de console.log
    } catch (error) {
      console.error("❌ Failed to submit message:", error);
    }
  };

  return (
    <main className="min-h-screen flex flex-col justify-between text-white">
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

      <section className="flex flex-col items-center flex-grow px-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-full bg-black bg-opacity-50 rounded-lg">
            <Progress className="w-1/2" value={progressValue} />
          </div>
        ) : (
          <>
            <section className="flex flex-col items-center justify-center w-full p-0 mt-24">
              {diagrams.length > 0 ? (
                <CardStack items={CARDS} />
              ) : (
                <p>Loading diagrams...</p>
              )}
            </section>
          </>
        )
        }
      </section >

      <section className="w-full fixed bottom-0 bg-black p-8">
        <div className="flex items-center mt-4 space-x-4 mb-4">
          <Select onValueChange={handleStyleChange}>
            <SelectTrigger className="bg-white p-2 rounded text-black w-20 hover:bg-accent hover:text-accent-foreground">
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
        <div className="flex flex-col items-center">
          <form className="flex items-center space-x-4 w-full" onSubmit={handleSubmit}>
            <Input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder={t('home.createPrompt')}
              className="w-full"
              disabled={status !== 'awaiting_message'}
            />
            <Button type="submit" className="w-24" variant="secondary">
              {t('home.createPrompt')}
            </Button>
          </form>
        </div>
      </section>
    </main >
  );
}