"use client";

import { Button } from "@/components/button/button";
import { SaveButton } from "@/components/button/save-button";
import { CopyButton } from "@/components/button/copy-button";
import { Input } from "@/components/common/searchbar";
import { Progress } from "@/components/common/loader";
import { LoginForm } from "@/components/user/login-form";
import { RegisterForm } from "@/components/user/register-form";
import { ParamsManager } from "@/components/user/params-manager";
import { useToast } from "@/components/alert/use-toast";
import ResultView from "@/components/results/result-view";

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
      {/* <LoginForm /> */}
      <RegisterForm />
      <ParamsManager />
    </main>
  );
}
