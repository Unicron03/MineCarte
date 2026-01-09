import Link from "next/link";
import { ChevronLeft, Unplug } from "lucide-react";
import { Separator } from "@/shadcn/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/shadcn/ui/avatar";
import { ThemeToggle } from "@/components/ThemeToggle";
import InfoPanel from "@/components/InfoPanel";
import { Button } from "@/shadcn/ui/button";
import { getUser } from "../../../prisma/requests";
import { userId } from "@/types";
import EditPseudoDialog from "@/components/profile/edit-pseudo-dialog";
import DeleteUserDialog from "@/components/profile/delete-user-dialog";

export const dynamic = 'force-dynamic';

export default async function Profile() {
    const stats = await getUser(userId);

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

                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{stats?.pseudo} (n°{stats?.id})</span>
                                <EditPseudoDialog userId={userId} currentPseudo={stats?.pseudo || ""} />
                            </div>

                            <span className="text-gray-400">{stats?.email}</span>
                        </div>
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
                    <DeleteUserDialog userId={userId} />
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