"use client";

import { useRef, useEffect } from "react";

export default function HorizontalScroll({ 
    children, 
    className = "" 
}: { 
    children: React.ReactNode;
    className?: string;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        const handleWheel = (e: WheelEvent) => {
            // Si on scroll verticalement, convertir en horizontal
            if (e.deltaY !== 0) {
                e.preventDefault();
                scrollContainer.scrollLeft += e.deltaY;
            }
        };

        scrollContainer.addEventListener('wheel', handleWheel, { passive: false });

        return () => {
            scrollContainer.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div 
            ref={scrollRef}
            className={`overflow-x-auto overflow-y-auto ${className}`}
        >
            {children}
        </div>
    );
}