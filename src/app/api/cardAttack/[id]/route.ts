import { getAttackById } from "@/prisma/requests";
import { NextResponse } from "next/server";

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await context.params;
        const parsedId = parseInt(id, 10);
        
        if (isNaN(parsedId)) {
            return NextResponse.json({ error: "Invalid ID supplied" }, { status: 400 });
        }
        
        const attack = await getAttackById(parsedId);
        
        if (!attack || attack.length === 0) {
            return NextResponse.json(null); // << retourne null si rien trouvé
        }
        
        return NextResponse.json(attack[0]);
    } catch (error) {
        console.error("Error in /api/cardAttack/[id]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
