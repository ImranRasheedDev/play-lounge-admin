import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    role: string;
    accessToken?: string;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Use admin-specific login endpoint (only SUPER_ADMIN role allowed)
          const res = await fetch(`${process.env.AUTH_API_URL}/api/auth/admin/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            console.error("Admin login failed:", errorData.message ?? "Unknown error");
            return null;
          }

          const data = await res.json();

          if (data.user && data.user.role === "SUPER_ADMIN") {
            return {
              id: data.user.id,
              email: data.user.email,
              name: data.user.name,
              role: data.user.role,
              accessToken: data.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.role && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      return session;
    },
  },
});
