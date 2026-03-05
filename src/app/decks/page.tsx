import { ThemeToggle } from "@/components/theme/ThemeToggle"
import InfoPanel from "@/components/InfoPanel"
import Footer from "@/components/Footer"
import { Button } from "@/shadcn/ui/button"
import Image from "next/image"
import { Check, CircleEllipsis } from "lucide-react"
import { defaultNbDecksPerUser, backCard, defaultNbCardsPerDeck } from "@/components/utils/types"
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
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu"
import DeckConstruction from "@/components/deck/deck-construction"
import { getUserCollection, getUserDecks } from "@/prisma/requests";
import CreateDeckButton from "@/components/deck/create-deck-button";
import DeleteDeckButton from "@/components/deck/delete-deck-button";
import RenameDeckDialog from "@/components/deck/rename-deck-dialog";
import DuplicateDeckButton from "@/components/deck/duplicate-deck-button";
import EquipDeckButton from "@/components/deck/equip-deck-button";
import { getCurrentUserId } from "@/lib/get-user"

export const dynamic = 'force-dynamic';

export default async function DecksPage() {
    const userId = await getCurrentUserId();
    const collection = await getUserCollection(userId);
    const userDecks = await getUserDecks(userId);

    return (
        <main className="flex flex-col min-h-screen p-4 tsparticles
            bg-fixed bg-cover bg-[linear-gradient(rgba(0,0,0,0.8),rgba(0,0,0,0.8)),url('/img/background_black.png')]
        ">
            <header className="flex justify-end items-center gap-4">
                <div className="fixed flex right-4 top-4 gap-4 z-50">
                    <ThemeToggle />
                    <InfoPanel />
                </div>
            </header>

            <div className="flex-1 flex flex-col gap-12 mb-4">
                <span className="text-2xl font-medium self-center">Ici vous pouvez choisir un deck et en construire jusqu&apos;à {defaultNbDecksPerUser}.</span>

                <div className="flex items-center justify-between gap-4">
                    <CreateDeckButton userId={userId} />
                    <span className="dark:outline-white outline-black outline-2 rounded-lg text-base font-medium p-2">Limite de decks : {userDecks.length}/{defaultNbDecksPerUser}</span>
                </div>

                <div className="flex flex-wrap justify-around gap-8">
                    {userDecks.map((deck) => (
                        <div key={deck.id} className="flex flex-col items-center gap-2">
                            <Drawer>
                                <DrawerTrigger asChild>
                                    <div className="relative w-64 h-88 cursor-pointer">
                                        {deck.deck_cards && deck.deck_cards.length > 0 ? (
                                            <>
                                                <Image 
                                                    className="absolute w-full h-full" 
                                                    src={deck.deck_cards[0].card.background_img} 
                                                    fill 
                                                    alt={deck.deck_cards[0].card.name}
                                                />
                                                {deck.deck_cards[0].card.third_img && (
                                                    <Image 
                                                        className="absolute w-full h-full" 
                                                        src={deck.deck_cards[0].card.third_img} 
                                                        fill 
                                                        alt={deck.deck_cards[0].card.name}
                                                    />
                                                )}
                                                <Image 
                                                    className="absolute w-full h-full" 
                                                    src={deck.deck_cards[0].card.main_img} 
                                                    fill 
                                                    alt={deck.deck_cards[0].card.name}
                                                />
                                            </>
                                        ) : (
                                            <Image className="absolute w-full h-full" src={backCard.third_img || ""} fill alt="Deck vide"/>
                                        )}
                                        {deck.is_active &&
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
                                        <span className="text-left font-medium text-base">Nombre de cartes dans le deck : {deck.deck_cards.reduce((sum, deckCard) => sum + deckCard.quantity, 0)} / {defaultNbCardsPerDeck}</span>
                                    </DrawerHeader>

                                    <DeckConstruction deck={deck} collection={collection} />

                                    <DrawerFooter>
                                        <DrawerClose asChild>
                                            <Button variant="outline">Fermer</Button>
                                        </DrawerClose>
                                    </DrawerFooter>
                                </DrawerContent>
                            </Drawer>

                            <div className="flex justify-center items-center gap-3 w-64">
                                <span className="text-xl font-bold truncate" title={deck.name || "Deck n°" + deck.id}>{deck.name}</span>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant={"link"} className="w-fit h-fit !p-0 hover:opacity-60">
                                            <CircleEllipsis />
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent className="w-56" align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuLabel>Actions sur le deck</DropdownMenuLabel>
                                            <EquipDeckButton 
                                                userId={userId}
                                                deckId={deck.id}
                                                isActive={deck.is_active || false}
                                            />
                                            <RenameDeckDialog
                                                deckId={deck.id}
                                                currentName={deck.name}
                                            />
                                            <DuplicateDeckButton 
                                                userId={userId}
                                                deckId={deck.id}
                                            />
                                            <DeleteDeckButton 
                                                userId={userId} 
                                                deckId={deck.id}
                                                deckName={deck.name}
                                                isActive={deck.is_active || false}
                                            />
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Footer className="mt-auto"/>
        </main>
    )
}