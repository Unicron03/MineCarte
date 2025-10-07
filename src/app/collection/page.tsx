import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import Footer from "@/components/Footer";
import { Store, Star } from "lucide-react";
import Card from "@/components/Card";

export default function Collection() {
    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex">
                <div className="glass-nav flex items-center text-base font-medium gap-2">
                    <Star className="m-2"/>
                    <span>Vitrine</span>
                </div>

                <div className="flex justify-end items-center w-full gap-4">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>
            
            <div className="flex-1 flex justify-center items-center glass-nav after:!rounded-3xl !rounded-3xl m-6 !p-6">
                <div className="glass-highlight w-full h-full rounded-3xl p-4 overflow-x-auto overflow-y-auto min-h-0">
                    {/* style={{ scrollbarColor: "#80808057 transparent" }} */}
                    <div className="grid grid-flow-col grid-rows-2 auto-rows-fr gap-4 h-full w-fit">
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card undescovered/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                        <Card/>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-end">
                <div className=""></div>

                <Footer />

                <div className="glass-nav">
                    <Store className="m-2"/>
                </div>
            </div>
        </main>
    );
}