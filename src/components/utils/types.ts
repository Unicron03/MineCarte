import { Prisma } from "../../../generated/prisma/client";
import localFont from 'next/font/local';

export const defaultNbCardGivenInChest: number = 5;
export const defaultNbDecksPerUser: number = 10;
export const defaultNbCardsPerDeck: number = 15;
export const defaultHoursTimeNextChest: number = 8;
export const myFont = localFont({ src: '../../app/fonts/Minecrafter.Reg.ttf' });

export type Card = {
    id: number;
    name: string;
    description: string | null;
    category: string;
    rarity: number;
    pv_durability: number;
    cost: number;
    talent: number | null;
    attack1: number;
    attack2: number | null;
    main_img: string;
    background_img: string;
    third_img: string | null;
    quantity?: number;
};

export type Deck = {
    id: number;
    name: string;
    cards: Card[];
};

export type Player = {
    id: string;
    cost: number;
    hand: Card[];
    board: Card[];
};

export type GameState = {
    roomId: string;
    players: Player[];
    turnIndex: number;
};

export const backCard: Prisma.cardsGetPayload<Record<string, never>> = {
    id: 0,
    name: "? ? ?",
    description: "Carte pas encore découverte !",
    category: "FORTEMPLATE",
    rarity: 0,
    pv_durability: 0,
    cost: 0,
    talent: null,
    attack1: 0,
    attack2: null,
    main_img: "/cards/transparent.png",
    background_img: "/cards/transparent.png",
    third_img: "/cards/back.png",
    folder_name: "cards/default.png",
}