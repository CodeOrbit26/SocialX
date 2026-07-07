import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        if (user.isSuspended) {
          throw new Error("Your account has been suspended by an administrator.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);

        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          role: user.role,
          credits: user.credits,
          reputationScore: user.reputationScore,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.credits = (user as any).credits;
        token.reputationScore = (user as any).reputationScore;
      }
      
      // Keep session credits and status up to date by fetching on token refresh
      if (token.id) {
        try {
          const dbUser = await db.user.findUnique({
            where: { id: token.id as string },
            select: { credits: true, reputationScore: true, isSuspended: true, role: true },
          });
          if (dbUser) {
            if (dbUser.isSuspended) {
              throw new Error("Account suspended");
            }
            token.credits = dbUser.credits;
            token.reputationScore = dbUser.reputationScore;
            token.role = dbUser.role;
          }
        } catch (error) {
          // Silent catch to prevent boot crashes if DB is down momentarily
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
        (session.user as any).credits = token.credits;
        (session.user as any).reputationScore = token.reputationScore;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
