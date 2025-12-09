import Link from "next/link";
import { ChevronLeft, Pencil, Unplug,  } from "lucide-react";
import { Separator } from "@/shadcn/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/shadcn/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import { Button } from "@/shadcn/ui/button";
import { userStats } from "../../../prisma/requests";

export const dynamic = 'force-dynamic';

export default async function Profile() {
    const stats = await userStats(1);

    return (
        <main className="flex flex-col h-screen p-4
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <header className="flex">
                <Link href="/home" className="flex items-center">
                    <ChevronLeft className="m-2"/>
                    <span className="font-medium">Retour</span>
                </Link>

                <div className="flex justify-end items-center w-full gap-4">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex flex-col items-center justify-center h-full gap-12">
                <span className="text-4xl font-bold">Paramètres du profil ({stats?.pseudo})</span>

                <div className="glass-nav w-120 !py-4 !px-6 after:!rounded-lg !rounded-lg flex justify-between">
                    <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12">
                            <AvatarImage src="https://github.com/unicron03.png" alt="@shadcn" />
                            <AvatarFallback>EN</AvatarFallback>
                        </Avatar>

                        <span className="font-medium">Pseudo</span>
                        <Button variant="link" size="icon">
                            <Pencil />
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <Separator orientation="vertical" />
                        <Button variant="link" size="icon">
                            <Unplug />
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <span className="font-medium text-2xl">Compte</span>
                    <button className="glass-nav w-120 !py-4 !px-6 after:!rounded-lg !rounded-lg flex flex-col items-start">
                        <span className="font-medium">Modifier le mot de passe</span>
                    </button>
                    <button className="glass-nav w-120 !py-4 !px-6 after:!rounded-lg !rounded-lg flex flex-col items-start">
                        <span className="font-medium">Supprimer le compte</span>
                    </button>
                </div>

                <div className="flex flex-col gap-4">
                    <span className="font-medium text-2xl">Amis</span>
                    <button className="glass-nav w-120 !py-4 !px-6 after:!rounded-lg !rounded-lg flex flex-col items-start">
                        <span className="font-medium">Demandes en cours</span>
                    </button>
                    <button className="glass-nav w-120 !py-4 !px-6 after:!rounded-lg !rounded-lg flex flex-col items-start">
                        <span className="font-medium">Demandes reçues</span>
                    </button>
                </div>
            </div>
        </main>
    );
}
