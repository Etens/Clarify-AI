"use client";

import React, { useState } from "react";
import ResultView from "../components/results/result-view";
import { Input } from "../components/common/searchbar";
import { Button } from "../components/button/button";
import { ParamsManager } from "@/components/user/params-manager";

export default function Home() {
  const [isLogin, setIsLogin] = useState("Login");

  return (
    <main>
      <div className="flex justify-end mt-10 mr-10 space-x-4">
        <ParamsManager />
        {/* if is login show login button else if show register button else show logout button */}
        {isLogin === "Login" ? (
          <Button onClick={() => setIsLogin("Logout")}>Logout</Button>
        ) : isLogin === "Register" ? (
          <Button onClick={() => setIsLogin("Register")}>Register</Button>
        ) : (
          <Button onClick={() => setIsLogin("Login")}>Login</Button>
        )}
      </div>
        <section className="flex items-center justify-between w-full mt-40 p-24">
          <div className="flex flex-col items-center">
            <ResultView />
          </div>
          <div className="flex flex-col items-center">
            <Input type="text" />
            <Button className="mt-4">Create</Button>
          </div>
        </section>
    </main>
  );
}
