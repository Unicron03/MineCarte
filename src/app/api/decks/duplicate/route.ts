import { duplicateDeck, getUserDecks } from "@/prisma/requests";
import { NextResponse } from "next/server";
import { defaultNbDecksPerUser } from "@/types";

export async function POST(request: Request) {
    try {
        const { userId, deckId } = await request.json();
        
        if (!userId || !deckId) {
            return NextResponse.json({ error: "User ID and Deck ID required" }, { status: 400 });
        }
        
        // Vérifier la limite de decks
        const userDecks = await getUserDecks(userId);
        
        if (userDecks.length >= defaultNbDecksPerUser) {
            return NextResponse.json({ 
                error: `Vous avez atteint la limite de ${defaultNbDecksPerUser} decks` 
            }, { status: 400 });
        }
        
        const newDeck = await duplicateDeck(userId, deckId);
        
        return NextResponse.json(newDeck, { status: 201 });
    } catch (error) {
        console.error("Error duplicating deck:", error);
        return NextResponse.json({ error: "Failed to duplicate deck" }, { status: 500 });
    }
}