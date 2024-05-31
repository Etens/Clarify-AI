import NextAuth, { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user?: {
      id?: string;
      language?: string;
      profileImage?: string;
      themePreference?: boolean;
      createdAt?: string;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    language?: string;
    profileImage?: string;
    themePreference?: boolean;
    createdAt?: string;
  }
  
  interface ElementData {
    ElementName: string;
    Keywords: string;
    Explanation: string;
    ImageURL?: string;
  }
  
  interface Diagram {
    id: string;
    title: string;
    userPrompt: string;
    elements: ElementData[];
    illustrationLinks: { [key: string]: string };
    user: User;
    likes: number;
  }
  
}
