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

  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      const assistantMessages = messages.filter((message) => message.role === "assistant");

      const filteredAndParsedMessages = assistantMessages
        .map((assistantMessage) => {
          const formattedContent = assistantMessage.content.replace(/\\n/g, "").trim();
          try {
            return JSON.parse(formattedContent);
          } catch (error) {
            console.error("Erreur lors du parsing du contenu du message de l'assistant:", error);
            return null;
          }
        })
        .filter((content) => content !== null);

      setAllMessagesReceived(filteredAndParsedMessages);
      console.log("Messages reçus: ", filteredAndParsedMessages);

    }
  }, [isLoading, messages]);

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
          <section className="flex items-center justify-between w-full mt-40 p-0 flex-col md:flex-row md:p-24 lg:justify-center">
            <div className="flex flex-col items-center md:mr-20">
              <ResultView />
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