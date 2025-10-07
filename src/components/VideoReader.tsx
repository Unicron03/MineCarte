"use client";

export function Video({ src }: { src: string }) {
    if (!src) return null;

    return (
        <video
            preload="none"
            autoPlay
            loop
            muted
            playsInline
            className="fixed top-0 left-0 h-screen w-auto min-w-full min-h-full object-cover -z-10"
        >
            <source src={src} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
}
