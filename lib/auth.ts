import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const missingEnvVars = [
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXTAUTH_SECRET",
  "NEXTAUTH_URL",
].filter((key) => !process.env[key]);

if (missingEnvVars.length > 0) {
  console.warn(
    `[auth] Missing environment variables: ${missingEnvVars.join(", ")}`
  );
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
