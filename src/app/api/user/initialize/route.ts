import { initializeUserData } from "@/lib/user-utils";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();
        
        if (!userId) {
            return NextResponse.json(
                { error: "User ID requis" },
                { status: 400 }
            );
        }

        await initializeUserData(userId);
        
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Erreur initialisation utilisateur:", error);
        return NextResponse.json(
            { error: "Échec de l'initialisation" },
            { status: 500 }
        );
    }
}