import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
    const dir = path.join(process.cwd(), "public/animated-background");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".mp4"));
    return NextResponse.json(files);
}