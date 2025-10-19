import { ThemeToggle } from "@/components/ThemeToggle"
import InfoPanel from "@/components/InfoPanel"
import Footer from "@/components/Footer"
import { Button } from "@/shadcn/ui/button"
import Image from "next/image"
import { Check, CircleEllipsis } from "lucide-react"
import { Deck } from "@/types"
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/shadcn/ui/drawer"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu"
import DeckConstruction from "@/components/deck-construction"

export default function DecksPage() {
    const deck1: Deck = {
        id: 1,
        name: "Mon super deck",
        cards: [{
            id: 1,
            name: "Creeper",
            description: "Un monstre vert qui explose",
            category: "Monstre",
            rarity: 2,
            pv_durability: 100,
            cost: 50,
            talent: null,
            attack1: 20,
            attack2: null,
            main_img: "/cards/creeper/front.png",
            background_img: "/cards/creeper/back.png",
            third_img: "/cards/creeper/mid.png",
        }, {
            id: 2,
            name: "Squelette",
            description: "Un squelette avec un arc",
            category: "Monstre",
            rarity: 3,
            pv_durability: 80,
            cost: 60,
            talent: null,
            attack1: 25,
            attack2: null,
            main_img: "/cards/skeleton/front.png",
            background_img: "/cards/skeleton/back.png",
            third_img: "/cards/skeleton/mid.png",
        }],
    }
    const deck2: Deck = {
        id: 2,
        name: "Un second deck très long mais nécessaire pour tester des choses avec des points",
        cards: [{
            id: 1,
            name: "Squelette",
            description: "Un squelette avec un arc",
            category: "Monstre",
            rarity: 3,
            pv_durability: 80,
            cost: 60,
            talent: null,
            attack1: 25,
            attack2: null,
            main_img: "/cards/skeleton/front.png",
            background_img: "/cards/skeleton/back.png",
            third_img: "/cards/skeleton/mid.png",
        }, {
            id: 2,
            name: "Creeper",
            description: "Un monstre vert qui explose",
            category: "Monstre",
            rarity: 2,
            pv_durability: 100,
            cost: 50,
            talent: null,
            attack1: 20,
            attack2: null,
            main_img: "/cards/creeper/front.png",
            background_img: "/cards/creeper/back.png",
            third_img: "/cards/creeper/mid.png",
        }],
    }
    const decks = [deck1, deck2, deck1, deck2, deck1, deck2, deck1, deck2, deck1, deck2, deck1, deck2, deck1, deck2, deck1, deck2]
    const idDeckActive = 2;
    const deckLimit = 15;

    return (
        <main className="flex flex-col h-screen p-4 tsparticles">
            <header className="flex justify-end items-center gap-4">
                <div className="fixed flex right-4 top-4 gap-4 z-50">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex-1 flex flex-col gap-4 mb-4">
                <span className="text-2xl font-medium self-center">Ici vous pouvez choisir un deck et en construire jusqu'à 5.</span>

                <div className="flex items-center justify-between gap-4">
                    <Button>Créer un nouveau deck</Button>
                    <span className="dark:outline-white outline-black outline-2 rounded-lg text-base font-medium p-2">Limite de decks : {decks.length}/{deckLimit}</span>
                </div>

                <div className="flex flex-wrap justify-between gap-y-8">
                    {decks.map((deck) => (
                        <div key={deck.id} className="flex flex-col items-center gap-2">
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <div className="relative w-64 h-88 cursor-pointer">
                                        <Image className="absolute w-full h-full" src={deck.cards[0].background_img} fill alt={deck.cards[0].name}/>
                                        { deck.cards[0].third_img && <Image className="absolute w-full h-full" src={deck.cards[0].third_img} fill alt={deck.cards[0].name}/> }
                                        <Image className="absolute w-full h-full" src={deck.cards[0].main_img} fill alt={deck.cards[0].name}/>
                                        {deck.id === 2 &&
                                            <div className="absolute -top-2 -right-2 z-10 bg-green-600 rounded-sm p-1">
                                                <Check />
                                            </div>
                                        }
                                    </div>
                                </DrawerTrigger>

                                <DrawerContent>
                                    <DrawerHeader>
                                        <DrawerTitle>Deck : {deck.name}</DrawerTitle>
                                        <DrawerDescription className="text-base text-gray-500">Ajouter en retirer des cartes en cliquant dessus</DrawerDescription>
                                    </DrawerHeader>

                                    <DeckConstruction deck={deck} />

                                    <DrawerFooter>
                                        <Button>Enregistrer</Button>
                                        <DrawerClose asChild>
                                            <Button variant="outline">Annuler</Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>

                            <div className="flex justify-center items-center gap-3 w-64">
                                <span className="text-xl font-bold truncate" title={deck.name}>{deck.name}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant={"link"} className="w-fit h-fit !p-0 hover:opacity-60">
                                            <CircleEllipsis />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>Actions sur le deck</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                                Équiper
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                Renommer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                Dupliquer
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                Supprimer
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer className="sticky bottom-4"/>
        </main>
    )
}