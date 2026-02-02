import { drawCards } from "@/prisma/requests";
import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { defaultHoursTimeNextChest } from "@/components/utils/types";

export async function POST(request: Request) {
    try {
        const { userId, amount, useKeys = false } = await request.json();
        
        // Vérifier le cooldown et les clés
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                timeNextChest: true, 
                inventory: { 
                    select: { keys: true } 
                } 
            }
        });

        if (!user) {
            return NextResponse.json(
                { error: "Utilisateur introuvable" }, 
                { status: 404 }
            );
        }

        const now = new Date();
        const timeLeft = user.timeNextChest.getTime() - now.getTime();
        const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));

        // Si le coffre n'est pas encore disponible
        if (timeLeft > 0) {
            const hoursLeft = Math.ceil(timeLeft / (1000 * 60 * 60));
            const keysNeeded = hoursLeft;
            const userKeys = user.inventory?.keys || 0;

            // Si l'utilisateur ne veut pas ou ne peut pas utiliser de clés
            if (!useKeys) {
                return NextResponse.json({
                    error: `Coffre pas encore disponible. Revenez à ${user.timeNextChest.getHours()}h${user.timeNextChest.getMinutes().toString().padStart(2, '0')}m${user.timeNextChest.getSeconds().toString().padStart(2, '0')}s, ou partez gagner des clés au combat !`,
                    canUseKeys: userKeys >= keysNeeded,
                    keysNeeded,
                    userKeys,
                    hoursLeft
                }, { status: 429 });
            }

            // Vérifier si l'utilisateur a assez de clés
            if (userKeys < keysNeeded) {
                return NextResponse.json({
                    error: `Vous n'avez pas assez de clés. Il vous faut ${keysNeeded} clés mais vous n'en avez que ${userKeys}.`,
                    keysNeeded,
                    userKeys
                }, { status: 400 });
            }

            // Utiliser les clés pour bypasser le cooldown
            await prisma.inventory.update({
                where: { user_id: userId },
                data: {
                    keys: {
                        decrement: keysNeeded
                    }
                }
            });
        }
        
        // Tirer les cartes
        const drawnCards = await drawCards(userId, amount);
        
        // Calculer le nouveau timeNextChest
        // Si on a utilisé des clés, partir de maintenant + defaultHours
        // Sinon, partir du timeNextChest actuel + defaultHours
        let newTimeNextChest: Date;

        if (timeLeft > 0 && useKeys) {
            const hoursLeftExact = timeLeft / (1000 * 60 * 60);
            const surplusHours = hoursLeft - hoursLeftExact;

            newTimeNextChest = new Date(
                now.getTime()
                + defaultHoursTimeNextChest * 60 * 60 * 1000
                - surplusHours * 60 * 60 * 1000
            );
        } else {
            newTimeNextChest = new Date(
                now.getTime() + defaultHoursTimeNextChest * 60 * 60 * 1000
            );
        }
        
        // Mettre à jour le cooldown
        await prisma.user.update({
            where: { id: userId },
            data: {
                timeNextChest: newTimeNextChest
            }
        });
        
        return NextResponse.json({ cards: drawnCards }, { status: 200 });
    } catch (error) {
        console.error("Error drawing cards:", error);
        const errorMessage = error instanceof Error ? error.message : "Failed to draw cards";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}