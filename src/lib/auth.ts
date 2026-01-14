import type { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Handle session updates
      if (trigger === "update" && session) {
        return { ...token, ...session };
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id as string;

        // Fetch fresh user data including credits and admin status
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              credits: true,
              subscriptionTier: true,
              subscriptionStatus: true,
              isAdmin: true,
              email: true,
            },
          });

          if (dbUser) {
            // Check if user email is in ADMIN_EMAILS list and auto-promote
            const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim().toLowerCase());
            const isAdminByEmail = dbUser.email && adminEmails.includes(dbUser.email.toLowerCase());

            // If user should be admin but isn't, update the database
            if (isAdminByEmail && !dbUser.isAdmin) {
              await prisma.user.update({
                where: { id: token.id as string },
                data: { isAdmin: true },
              });
              dbUser.isAdmin = true;
            }

            (session.user as any).credits = dbUser.credits;
            (session.user as any).subscriptionTier = dbUser.subscriptionTier;
            (session.user as any).subscriptionStatus = dbUser.subscriptionStatus;
            (session.user as any).isAdmin = dbUser.isAdmin || isAdminByEmail;
          }
        } catch (error) {
          console.error("Failed to fetch user data:", error);
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
};

// Type extensions for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      credits?: number;
      subscriptionTier?: string | null;
      subscriptionStatus?: string | null;
      isAdmin?: boolean;
    };
  }
}
