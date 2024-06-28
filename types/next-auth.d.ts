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
    Illustration: string;
    Explanation: string;
  }

  interface Comment {
    id: string;
    userId: string;
    diagramId: string;
    user: User;
    content: string;
    createdAt: string;
  }

  interface Diagram {
    createdAt: string | number | Date;
    content: any;
    id: string;
    title: string;
    language: string;
    userPrompt: string;
    elements: ElementData[];
    illustrationLinks: { [key: string]: string };
    user: User;
    likes: number;
    views: number;
    tags: string[];
    comments: Comment[];
  }
}
