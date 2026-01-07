import { createDeck, getUserDecks } from "@/prisma/requests";
import { NextResponse } from "next/server";
import { defaultNbDecksPerUser } from "@/types";

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();
        
        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // Vérifier la limite de decks
        const userDecks = await getUserDecks(userId);
        
        if (userDecks.length >= defaultNbDecksPerUser) {
            return NextResponse.json({ 
                error: `Vous avez atteint la limite de ${defaultNbDecksPerUser} decks` 
            }, { status: 400 });
        }
        
        const newDeck = await createDeck(userId);
        
        return NextResponse.json(newDeck, { status: 201 });
    } catch (error) {
        console.error("Error creating deck:", error);
        return NextResponse.json({ error: "Failed to create deck" }, { status: 500 });
    }
}