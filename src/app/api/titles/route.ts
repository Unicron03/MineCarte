import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    const dir = path.join(process.cwd(), "public/titles");
    const files = fs.readdirSync(dir).filter(f => /\.(png|jpg|jpeg|gif)$/i.test(f));
    if (files.length === 0) {
        return NextResponse.json({ error: 'No titles found' }, { status: 404 });
    }
    const randomIndex = Math.floor(Math.random() * files.length);
    const randomFile = files[randomIndex];
    return NextResponse.json({ url: `/titles/${randomFile}` });
}