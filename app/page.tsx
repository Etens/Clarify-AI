"use client";

import { Button } from "@/components/button/Button";
import { SaveButton } from "@/components/button/SaveButton";
import { CopyButton } from "@/components/button/CopyButton";
import { Input } from "@/components/input/SearchBar";
import { Progress } from "@/components/loader/Loader";
import ResultView from "@/components/results//ResultView";
import { LoginForm } from "@/components/user/LoginForm";
import { RegisterForm } from "@/components/user/RegisterForm";
import { ParamsManager } from "@/components/user/ParamsManager";
import { useToast } from "@/components/alert/use-toast";

export default function Home() {
  const { toast } = useToast();

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <Button variant="destructive" size="lg">
        Button
      </Button>
      <Button
        variant="outline"
        onClick={() => {
          toast({
            description: "Your message has been sent.",
          });
        }}
      >
        Show Toast
      </Button>
      <SaveButton />
      <CopyButton />
      <Input />
      <Progress value={10} />
      <ResultView />
      <LoginForm />
      <RegisterForm />
      <ParamsManager />
    </main>
  );
}
