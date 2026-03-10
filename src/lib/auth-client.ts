import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    // Utiliser des requêtes relatives pour fonctionner correctement en production
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "",
});

export const { signIn, signUp, signOut, useSession } = authClient;