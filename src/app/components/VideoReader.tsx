"use client";

import { useEffect, useState } from "react";

export function Video() {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);

    useEffect(() => {
        fetch("/api/videos")
            .then(res => res.json())
            .then((files: string[]) => {
                const dayOfYear = Math.floor(
                    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const index = dayOfYear % files.length;
                setVideoSrc(`/animated-background/${files[index]}`);
            });
    }, []);

    if (!videoSrc) return null;

    return (
        <video
            preload="none"
            autoPlay
            loop
            muted
            playsInline
            className="fixed top-0 left-0 h-screen w-auto min-w-full min-h-full object-cover -z-10"
        >
            <source src={videoSrc} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}