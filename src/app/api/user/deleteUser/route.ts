import { deleteUser } from "@/prisma/requests";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { userId } = await request.json();
        
        if (!userId) {
            return NextResponse.json({ error: "User ID requis" }, { status: 400 });
        }
        
        const deletedUser = await deleteUser(userId);

        return NextResponse.json(deletedUser, { status: 200 });
    } catch (error) {
        console.error("Error deleting user:", error);
        return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
    }
}