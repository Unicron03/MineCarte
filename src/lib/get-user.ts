import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });
    
    if (!session?.user) {
        redirect("/");
    }
    
    return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
    };
}

export async function getCurrentUserId(): Promise<string> {
    const user = await getCurrentUser();
    return user.id;
}