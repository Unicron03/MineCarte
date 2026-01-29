import { drawCards } from "@/prisma/requests";
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { defaultHoursTimeNextChest } from "@/components/utils/types";

// Dans app/api/cards/draw/route.ts
export async function POST(request: Request) {
    try {
        const { userId, amount } = await request.json();
        
        // Vérifier le cooldown
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { timeNextChest: true }
        });
        
        if (user && user.timeNextChest > new Date()) {
            const timeLeft = Math.ceil((user.timeNextChest.getTime() - Date.now()) / 1000 / 60);
            return NextResponse.json(
                { error: `Coffre disponible dans ${timeLeft} minute(s)` }, 
                { status: 429 }
            );
        }
        
        const drawnCards = await drawCards(userId, amount);
        
        // Mettre à jour le cooldown (ex: 8)
        await prisma.user.update({
            where: { id: userId },
            data: { timeNextChest: new Date(Date.now() + defaultHoursTimeNextChest * 60 * 60 * 1000) }
        });
        
        return NextResponse.json({ cards: drawnCards }, { status: 200 });
    } catch (error) {
        console.error("Error drawing cards:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to draw cards";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}