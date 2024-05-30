import NextAuth, { AuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GitHubProvider from 'next-auth/providers/github';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('🔑 Authorizing user with credentials');
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Email and password are required');
          throw new Error('Email and password are required');
        }

        let user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (user) {
          console.log('👤 User found:', user.email);
          if (user.password === null) {
            console.log('❌ User password is null');
            throw new Error('User password is null');
          }
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);
          if (!isValidPassword) {
            console.log('❌ Invalid password');
            throw new Error('Invalid password');
          }
        } else {
          console.log('🆕 Creating new user');
          const hashedPassword = await bcrypt.hash(credentials.password, 10);
          user = await prisma.user.create({
            data: {
              email: credentials.email,
              password: hashedPassword,
              name: credentials.email.split('@')[0], 
            },
          });
        }

        console.log('✅ User authorized:', user.email);
        return { id: user.id, name: user.name, email: user.email, language: user.language ?? "en" };
      }
    })
  ],
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      console.log('🔐 JWT callback triggered');
      if (trigger === "update") {
        return { ...token, ...session.user };
      }
      return { ...token, ...user };
    },
    async session({ session, token }) {
      console.log('📦 Session callback triggered');
      session.user = token as any;
      return session;
    },
  },
};

export { authOptions };

const checkHeaders = (req: NextApiRequest, res: NextApiResponse) => {
  console.log('🔍 Checking headers size');
  if (Object.keys(req.headers).some(header => header.length > 8000)) {
    console.log('🚫 Header size too large');
    res.status(431).json({ error: 'Header size too large' });
    return false;
  }
  return true;
};

export const GET = (req: NextApiRequest, res: NextApiResponse) => {
  console.log('📥 Incoming GET request');
  if (!checkHeaders(req, res)) return;
  console.log('🟢 GET request headers are within acceptable size');
  return NextAuth(req, res, authOptions);
};

export const POST = (req: NextApiRequest, res: NextApiResponse) => {
  console.log('📥 Incoming POST request');
  if (!checkHeaders(req, res)) return;
  console.log('🟢 POST request headers are within acceptable size');
  return NextAuth(req, res, authOptions);
};
