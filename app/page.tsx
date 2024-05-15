"use client";

import React, { useState, useEffect } from "react";
import { useChat } from "ai/react";
import axios from "axios";
import ResultView from "../components/results/result-view";
import { Input } from "../components/common/searchbar";
import { Button } from "../components/button/button";
import { ParamsManager } from "@/components/user/params-manager";
import { Progress } from "@/components/common/loader";

export default function Home() {
  const [isLogin, setIsLogin] = useState("Login");
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const [allMessagesReceived, setAllMessagesReceived] = useState<any[]>([]);
  const [illustrationLinks, setIllustrationLinks] = useState({});
  const [style, setStyle] = useState("rafiki");

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
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

    console.log("Éléments à traiter :", elements);

    const illustrationPromises = elements.map(async (element: any) => {
      const keywords = element.Keywords.split(", ").map((keyword: string) => keyword.trim());
      for (let keyword of keywords) {
        const url = `http://localhost:3000/api/illustrations?keyword=${keyword}&style=${style}`;
        console.log(`Requête pour le mot-clé ${keyword} à l'URL : ${url}`);
        try {
          const response = await axios.get(url);
          if (response.status === 200 && response.data) {
            console.log(`URL d'illustration trouvée pour ${element.ElementName} : ${response.data}`);
            return { element: element.ElementName, url: response.data };
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération de l'illustration pour le mot-clé ${keyword}:`, error);
        }
      }
      return { element: element.ElementName, url: null };
    });

    const illustrationResults = await Promise.all(illustrationPromises);
    console.log("Résultats des illustrations :", illustrationResults);

    const newIllustrationLinks = illustrationResults.reduce((acc, curr) => {
      if (curr.url) {
        acc[curr.element] = curr.url;
      }
      return acc;
    }, {});

    console.log("Liens d'illustration mis à jour :", newIllustrationLinks);
    setIllustrationLinks(newIllustrationLinks);
  };

  return (
    <main>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen">
          <Progress className="w-1/2" value={50} />
        </div>
      ) : (
        <>
          <div className="flex justify-end mt-10 mr-10 space-x-4">
            <ParamsManager />
            {isLogin === "Login" ? <Button onClick={() => setIsLogin("Logout")}>Logout</Button> : isLogin === "Register" ? <Button onClick={() => setIsLogin("Register")}>Register</Button> : <Button onClick={() => setIsLogin("Login")}>Login</Button>}
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
              <ResultView elements={allMessagesReceived[allMessagesReceived.length - 1]?.elements || []} illustrationLinks={illustrationLinks} />
            </div>
            <form className="flex flex-col items-center w-full mt-20 p-10 md:mt-0 md:w-60 md:p-0" onSubmit={handleSubmit}>
              <Input type="text" value={input} onChange={handleInputChange} placeholder="Create..." />
              <Button type="submit" className="mt-4">
                Create
              </Button>
            </form>
          </section>
        </>
      )}
    </main>
  );
}