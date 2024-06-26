import type { Metadata } from "next";
import "../styles/globals.css";
import { Toaster } from "@/components/alert/toaster";
import Providers from '@/components/user/providers';
import I18nProviderWrapper from '@/components/I18nProviderWrapper'; 

export const metadata: Metadata = {
  title: "Clarify",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en"> 
      <head />
      <body>
        <Providers>
          <I18nProviderWrapper> 
            <main>{children}</main>
            <Toaster />
          </I18nProviderWrapper>
        </Providers>
      </body>
    </html>
  );
}
