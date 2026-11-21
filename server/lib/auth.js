import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma.js";
import dotenv from "dotenv";
dotenv.config();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${process.env.PORT || 5001}`,
  trustedOrigins: [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://10.7.2.133:5173",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  onAPIError: {
    onError(error) {
      console.error("Better Auth Error:", error);
    },
  },
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET,
  //   },
  // },
});
