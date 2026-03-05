import { ThemeToggle } from "@/components/theme/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";

export default async function CombatMode({ params }: { params: Promise<{ modeSlug: string }> }) {
    const { modeSlug } = await params;

    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <div className="fixed items-center flex right-4 top-4 gap-4 z-50">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>
            
            <p className="flex justify-center h-full items-center">{modeSlug}</p>
        </main>
    )
}