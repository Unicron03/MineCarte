import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    trustedOrigins: [
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        "http://localhost:3000", // Garde localhost pour le dev local
    ],
    
    emailAndPassword: { 
        enabled: true, 
    },
    
    // socialProviders: { 
    //     github: { 
    //         clientId: process.env.GITHUB_CLIENT_ID as string, 
    //         clientSecret: process.env.GITHUB_CLIENT_SECRET as string, 
    //     },
    // },
});