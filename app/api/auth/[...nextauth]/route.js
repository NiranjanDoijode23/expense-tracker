import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import prisma from "@/lib/prisma";

export const authOptions = {
  trustHost: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        let user = await prisma.user.findUnique({
          where: { email: profile.email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email: profile.email,
              name: profile.name,
              image: profile.picture,
            },
          });
        } else {
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              name: user.name || profile.name || null,
              image: profile.picture || user.image,
            },
          });
        }

        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.plan = user.plan;
      }

      return token;
    },

    async session({ session, token }) {
      session.user = {
        ...session.user,
        id: token.id,
        plan: token.plan,
      };
      return session;
    },

    // ✅ 🔥 THIS IS WHAT YOU WERE MISSING
    async redirect({ url, baseUrl }) {
      // Allow relative callback URLs and same-origin callbacks only.
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        const callbackUrl = new URL(url);
        if (callbackUrl.origin === baseUrl) return url;
      } catch {
        // Fall through to default.
      }
      return `${baseUrl}/dashboard`;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };