"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { RoundedStar } from "@smastrom/react-rating";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shadcn/ui/dialog";
import { Rating } from "@smastrom/react-rating";
import Atropos from "atropos/react";
import { Separator } from "@/shadcn/ui/separator";
import AtroposCard from "./AtroposCard";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Button } from "@/shadcn/ui/button";
import { useState } from "react";
import { Prisma } from "../../../generated/prisma/client";

const queryClient = new QueryClient();

const ratingStyle = {
    itemShapes: RoundedStar,
    activeFillColor: "#ffb700",
    inactiveFillColor: "#fbf1a9",
};

export const dynamic = 'force-dynamic';

async function fetchAttack(id: number | null) {
    if (!id) return null;
    const res = await fetch(`/api/cardAttack/${id}`);
    if (!res.ok) return null;
    return res.json();
}

type CardType = Prisma.cardsGetPayload<Record<string, never>>;

function CardPopupDetailsInner(
    { undescovered = true, favorite, quantity, rarity, card }:
    { undescovered?: boolean, favorite?: boolean, quantity?: number, rarity?: number, card: CardType })
{
    const [isFavorite, setIsFavorite] = useState(favorite);

    const invertFavorite = async () => {
        const newFavoriteState = !isFavorite;
        setIsFavorite(newFavoriteState); // Mise à jour immédiate du visuel
        
        try {
            await fetch(`/api/cards/setCardFavorite/${card.id}/${newFavoriteState}`);
        } catch (error) {
            // En cas d'erreur, on remet l'état précédent
            setIsFavorite(!newFavoriteState);
            console.error("Erreur lors de la mise à jour du favori:", error);
        }
    };

    const talent = useQuery({
        queryKey: ["attack", card.talent],
        queryFn: () => fetchAttack(card.talent)
    });

    const attack1 = useQuery({
        queryKey: ["attack", card.attack1],
        queryFn: () => fetchAttack(card.attack1)
    });

    const attack2 = useQuery({
        queryKey: ["attack", card.attack2],
        queryFn: () => fetchAttack(card.attack2)
    });

    return (
        <div className="card self-center w-fit min-w-[230px] max-w-[230px] h-full content-center relative">
            { undescovered && (
                <Star
                    size={24}
                    className="absolute z-50 card-star cursor-pointer -left-1.5 -top-1.5"
                    color="gold"
                    fill={isFavorite ? "gold" : "none"}
                    onClick={invertFavorite}
                />
            )}

            <Dialog>
                <DialogTrigger asChild>
                    <AtroposCard card={card} />
                </DialogTrigger>

                <DialogContent className="sm:max-w-[900px] h-fit bg-white dark:bg-black">
                    <DialogHeader>
                        <DialogTitle className="self-center">{card.name}</DialogTitle>
                    </DialogHeader>

                    <div className="flex gap-8">
                        <div className="flex flex-col items-center justify-center min-w-[350px]">
                            <Atropos className="atropos-banner p-2" highlight={false}>
                                <Image
                                    className="atropos-banner-spacer"
                                    src="/cards/creeper/back.png"
                                    alt="Creeper card"
                                    width={230}
                                    height={300}
                                />

                                <Image
                                    data-atropos-offset="-2"
                                    className="w-fit h-full z-40"
                                    src={card.background_img}
                                    alt={card.background_img}
                                    width={230}
                                    height={300}
                                />

                                {card.third_img && (
                                    <Image
                                        data-atropos-offset="0"
                                        className="w-fit h-full z-40"
                                        src={card.third_img}
                                        alt={card.third_img}
                                        width={230}
                                        height={300}
                                    />
                                )}

                                <Image
                                    data-atropos-offset="2"
                                    className="w-fit h-full z-40"
                                    src={card.main_img}
                                    alt={card.main_img}
                                    width={230}
                                    height={300}
                                />
                            </Atropos>

                            { undescovered &&
                                <div className="flex items-center gap-2">
                                    <Button variant={null} className="p-2" onClick={invertFavorite}>
                                        <Star className="card-star" color="gold" fill={isFavorite ? "gold" : "none"} />
                                        <span>Ajouter aux favoris</span>
                                    </Button>
                                </div>
                            }
                        </div>

                        <div className="flex flex-col gap-4 w-full text-base font-medium my-8">
                            <div className="flex items-center gap-4 justify-between">
                                <span>Rareté :</span>
                                <Rating
                                    style={{ maxWidth: 100 }}
                                    items={3}
                                    value={rarity || card.rarity}
                                    readOnly
                                    itemStyles={ratingStyle}
                                />
                            </div>

                            <Separator />

                            {talent.isPending ?
                                <span>Talent : Chargement...</span>
                            :
                                <>
                                    { talent.data === null ?
                                        <span>Talent : /</span>
                                    :
                                        <>
                                            <span><u>Talent</u> : {talent.data?.name}</span>
                                            <span>{talent.data?.description}</span>
                                        </>
                                    }
                                </>
                            }
                            
                            <Separator />

                            { attack1.isLoading ? <span><u>Attaque 1</u> : Chargement...</span> :
                                <>
                                    { attack1.data === null ?
                                        <span><u>Attaque 1</u> : /</span>
                                    :
                                        <>
                                            <span>
                                                <u>Attaque 1</u> : {attack1.data?.name + " "}
                                                <span>{attack1.data?.damage && "(" + attack1.data?.damage + ")"}</span>
                                            </span>
                                            <span>{attack1.data?.description}</span>
                                        </>
                                    }
                                </>
                            }
                            { attack2.isLoading ? <span><u>Attaque 2</u> : Chargement...</span> :
                                <>
                                    { attack2.data === null ?
                                        <span><u>Attaque 2</u> : /</span>
                                    :
                                        <>
                                            <span>
                                                <u>Attaque 2</u> : {attack2.data?.name + " "}
                                                <span>{attack2.data?.damage && "(" + attack2.data?.damage + ")"}</span>
                                            </span>
                                            <span>{attack2.data?.description}</span>
                                        </>
                                    }
                                </>
                            }

                            <Separator />

                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                                <span className="font-semibold">Numéro de la carte :</span>
                                <span className="text-right">{card.id}</span>

                                {quantity &&
                                    <>
                                        <span className="font-semibold">Quantité possédé :</span>
                                        <span className="text-right">{quantity}</span>
                                    </>
                                }
                            </div>

                            <Separator />

                            <span>{card.description}</span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default function CardPopupDetails(props: {
    undescovered?: boolean;
    favorite?: boolean;
    quantity?: number;
    rarity?: number;
    card: CardType;
}) {
    return (
        <QueryClientProvider client={queryClient}>
            <CardPopupDetailsInner {...props} />
        </QueryClientProvider>
    );
}