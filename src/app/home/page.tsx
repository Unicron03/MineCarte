import { Video } from "@/components/VideoReader";
import fs from "fs";
import path from "path";
import HomePageClient from "@/components/HomePageClient";

async function getVideoOfTheDay() {
    const dir = path.join(process.cwd(), "public/animated-background");
    const files = fs.readdirSync(dir).filter(f => f.endsWith(".mp4"));
    if (files.length === 0) {
        return null;
    }
    const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const index = dayOfYear % files.length;
    return `/animated-background/${files[index]}`;
}

export default async function Home() {
    const videoSrc = await getVideoOfTheDay();

    return <HomePageClient videoSrc={videoSrc} />;
}
