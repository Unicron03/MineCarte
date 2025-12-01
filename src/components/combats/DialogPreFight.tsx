import Link from "next/link";
import Leaderboard from "@/components/leaderboard";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Button } from "@/shadcn/ui/button";
import DeckVisualiser from "../DeckVisualiser";
import Image from "next/image";
import Lighting from "../particles/Lighting";

export default function DialogPreFight({ btnName, modeName, bg, link }: { btnName?: string, modeName?: string, bg?: string, link: string }) {

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="glass-nav h-fit text-black dark:text-white text-2xl font-bold">{btnName}</Button>
            </DialogTrigger>
            <DialogContent className="w-3/4 !max-w-screen h-3/4 !max-h-screen lg:max-w-screen-lg overflow-auto">
                <div className="flex gap-8 h-full">
                    <div className="w-1/2 h-full">
                        <Leaderboard />
                    </div>

                    <div className="w-1/2 h-full flex flex-col gap-8 items-center justify-center">
                        <div className="flex flex-col items-center w-full h-full glass-nav after:!rounded-2xl !rounded-2xl !p-4">
                            <span className="text-2xl font-bold">Stats perso</span>
                            <div className="flex flex-col justify-evenly h-full w-full font-medium">
                                <span>Victoires : </span>
                                <span>Défaites : </span>
                                <span>Taux de victoire : </span>
                                <span>Nombre de matchs joués : </span>
                            </div>
                        </div>  

                        <div className="flex gap-8 w-full h-full">
                            <DeckVisualiser />

                            <Link href={"combats/" + link} className="flex justify-center items-center text-center glass-nav-green after:!rounded-2xl !rounded-2xl !h-full text-2xl font-bold">
                                <span className="mx-6 my-2">Lancer le combat ! {modeName}</span>

                                <Lighting />
                                <Image unoptimized className="absolute top-0 left-0 w-full h-full object-cover !rounded-2xl -z-10" src={"/img/" + bg + ".gif"} alt="Bannière combat" width={1920} height={1080} />
                            </Link>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}