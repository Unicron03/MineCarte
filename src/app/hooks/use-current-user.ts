"use client";

import { useSession } from "@/lib/auth-client";

export function useCurrentUser() {
    const { data: session, isPending } = useSession();
    
    return {
        userId: session?.user?.id || null,
        user: session?.user || null,
        isLoading: isPending,
    };
}