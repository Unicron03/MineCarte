import { equipDeck } from "@/prisma/requests";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { userId, deckId } = await request.json();
        
        if (!userId || !deckId) {
            return NextResponse.json({ error: "User ID and Deck ID required" }, { status: 400 });
        }
        
        const updatedDeck = await equipDeck(userId, deckId);
        
        return NextResponse.json(updatedDeck, { status: 200 });
    } catch (error) {
        console.error("Error equipping deck:", error);
        return NextResponse.json({ error: "Failed to equip deck" }, { status: 500 });
    }
}