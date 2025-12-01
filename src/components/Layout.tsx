import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

export default function Layout() {
    const location = useLocation();
    
    return (
        <>            
            <AnimatePresence mode="wait">
                <motion.main
                    key={location.pathname}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="min-h-screen w-full"
                >
                    <Outlet />
                </motion.main>
            </AnimatePresence>
        </>
    );
}
