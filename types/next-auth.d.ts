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
}
