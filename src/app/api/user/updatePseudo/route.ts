import { updateUserPseudo } from "@/prisma/requests";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
    try {
        const { userId, newPseudo } = await request.json();
        
        if (!userId || !newPseudo) {
            return NextResponse.json({ error: "User ID et nouveau pseudo requis" }, { status: 400 });
        }
        
        const trimmedPseudo = newPseudo.trim();
        
        if (trimmedPseudo.length < 2 || trimmedPseudo.length > 15) {
            return NextResponse.json({ error: "Le pseudo doit contenir entre 2 et 15 caractères" }, { status: 400 });
        }
        
        // Vérifier si le pseudo existe déjà
        const existingUser = await prisma.user.findFirst({
            where: {
                name: trimmedPseudo,
                NOT: { id: userId }
            }
        });
        
        if (existingUser) {
            return NextResponse.json({ error: "Ce pseudo est déjà utilisé" }, { status: 400 });
        }
        
        const updatedUser = await updateUserPseudo(userId, trimmedPseudo);
        
        return NextResponse.json(updatedUser, { status: 200 });
    } catch (error) {
        console.error("Error updating pseudo:", error);
        return NextResponse.json({ error: "Failed to update pseudo" }, { status: 500 });
    }
}