"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, LibraryBig, HandFist } from "lucide-react";
import { cn } from "@/shadcn/lib/utils";

const navItems = [
    { name: "Accueil", path: "/home", icon: <Home /> },
    { name: "Collection", path: "/collection", icon: <LibraryBig /> },
    { name: "Combats", path: "/combats", icon: <HandFist /> },
];

export default function Footer({ left, right, className }: { left?: React.ReactNode, right?: React.ReactNode, className?: string }) {
    const pathname = usePathname();
    
    return (
        <footer className={cn("grid grid-cols-[1fr_auto_1fr] items-end w-full mt-4 z-50", className)}>
            <div className="flex">{left}</div>

            <motion.nav
                className={`flex gap-4 items-center justify-center m-auto glass-nav`}
                style={{width: "fit-content"}}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    
                    return (
                        <div key={item.path} className="relative px-3 py-2">
                            {isActive && (
                                <motion.div
                                    layoutId="nav-highlight"
                                    className="absolute inset-0 rounded-full z-0 glass-highlight"
                                    transition={{
                                        type: "spring",
                                        stiffness: 500,
                                        damping: 30,
                                    }}
                                />
                            )}

                            <Link
                                key={item.path}
                                href={item.path}
                                className={`relative z-10 py-1 rounded-full text-base font-medium transition-all duration-300 cursor-pointer ${
                                    isActive ? "nav-link-active" : ""
                                }`}
                            >
                                <div className="flex flex-col items-center mx-6 gap-1.5">
                                    {item.name}
                                    {item.icon}
                                </div>
                            </Link>

                        </div>
                    );
                })}
            </motion.nav>

            <div className="flex justify-end">{right}</div>
        </footer>
    );
}
