import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const navItems = [
    { name: "Accueil", path: "/" },
    { name: "Collection", path: "/collection" },
    { name: "Combats", path: "/combats" },
];

export default function Footer() {
    const { pathname } = useLocation();
    
    return (
        <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 m-4 w-full">
            <motion.nav
                className={`flex gap-4 items-center justify-center m-auto glass-nav`}
                style={{width: "fit-content"}}
            >
                {navItems.map((item) => {
                    const isActive = pathname === item.path;
                    
                    return (
                        <div key={item.path} className="relative px-2 py-1">
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
                                to={item.path}
                                className={`relative z-10 mx-4 py-1 rounded-full text-base font-medium transition-all duration-300 cursor-pointer ${
                                    isActive ? "nav-link-active" : ""
                                }`}
                            >
                                {item.name}
                            </Link>

                        </div>
                    );
                })}
            </motion.nav>
        </footer>
    );
}
