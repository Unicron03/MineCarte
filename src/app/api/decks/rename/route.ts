import { renameDeck } from "@/prisma/requests";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { deckId, newName } = await request.json();
        
        if (!deckId || !newName) {
            return NextResponse.json({ error: "User ID, Deck ID and new name required" }, { status: 400 });
        }
        
        if (newName.trim().length === 0) {
            return NextResponse.json({ error: "Le nom ne peut pas être vide" }, { status: 400 });
        }
        
        if (newName.length > 50) {
            return NextResponse.json({ error: "Le nom ne peut pas dépasser 50 caractères" }, { status: 400 });
        }
        
        const updatedDeck = await renameDeck(deckId, newName.trim());
        
        return NextResponse.json(updatedDeck, { status: 200 });
    } catch (error) {
        console.error("Error renaming deck:", error);
        return NextResponse.json({ error: "Failed to rename deck" }, { status: 500 });
    }
}