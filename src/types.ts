import { Prisma } from "../generated/prisma/client";

export const userId: number = 2;
export const defaultNbCardGivenInChest: number = 5;
export const defaultNbDecksPerUser: number = 10;
export const defaultNbCardsPerDeck: number = 15;
export const defaultHoursTimeNextChest: number = 8;

export type Card = {
    id: number;
    name: string;
    description: string;
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

export const backCard: Prisma.cardsGetPayload<{}> = {
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
}

export const exampleCollectionCards: Card[] = [
    {
        id: 1,
        name: "Creeper",
        description: "Un monstre vert qui explose",
        category: "Monstre",
        rarity: 4,
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
    }, {
        id: 3,
        name: "Zombie",
        description: "Un zombie qui pue",
        category: "Monstre",
        rarity: 1,
        pv_durability: 120,
        cost: 40,
        talent: null,
        attack1: 15,
        attack2: null,
        main_img: "/cards/araignee/front.png",
        background_img: "/cards/araignee/back.png",
        third_img: "/cards/araignee/mid.png",
    }, {
        id: 4,
        name: "Enderman",
        description: "Un enderman qui se téléporte",
        category: "Monstre",
        rarity: 4,
        pv_durability: 90,
        cost: 70,
        talent: null,
        attack1: 30,
        attack2: null,
        main_img: "/cards/enderman.png",
        background_img: "/cards/enderman.png",
        third_img: "/cards/enderman.png",
    }, {
        id: 5,
        name: "Ghast",
        description: "Un monstre vert qui explose",
        category: "Monstre",
        rarity: 4,
        pv_durability: 100,
        cost: 50,
        talent: null,
        attack1: 20,
        attack2: null,
        main_img: "/cards/ghast/front.png",
        background_img: "/cards/ghast/back.png",
        third_img: "/cards/ghast/mid.png",
    }, {
        id: 6,
        name: "Villageois",
        description: "Un squelette avec un arc",
        category: "Monstre",
        rarity: 3,
        pv_durability: 80,
        cost: 60,
        talent: null,
        attack1: 25,
        attack2: null,
        main_img: "/cards/villager/front.png",
        background_img: "/cards/villager/back.png",
        third_img: "/cards/villager/mid.png",
    }, {
        id: 7,
        name: "Tortue",
        description: "Un zombie qui pue",
        category: "Monstre",
        rarity: 1,
        pv_durability: 120,
        cost: 40,
        talent: null,
        attack1: 15,
        attack2: null,
        main_img: "/cards/turtle/front.png",
        background_img: "/cards/turtle/back.png",
        third_img: "/cards/turtle/mid.png",
    }, {
        id: 8,
        name: "Enderman",
        description: "Un enderman qui se téléporte",
        category: "Monstre",
        rarity: 4,
        pv_durability: 90,
        cost: 70,
        talent: null,
        attack1: 30,
        attack2: null,
        main_img: "/cards/enderman.png",
        background_img: "/cards/enderman.png",
        third_img: "/cards/enderman.png",
    }, {
        id: 9,
        name: "Creeper",
        description: "Un monstre vert qui explose",
        category: "Monstre",
        rarity: 4,
        pv_durability: 100,
        cost: 50,
        talent: null,
        attack1: 20,
        attack2: null,
        main_img: "/cards/creeper/front.png",
        background_img: "/cards/creeper/back.png",
        third_img: "/cards/creeper/mid.png",
    }, {
        id: 10,
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
        id: 11,
        name: "Zombie",
        description: "Un zombie qui pue",
        category: "Monstre",
        rarity: 1,
        pv_durability: 120,
        cost: 40,
        talent: null,
        attack1: 15,
        attack2: null,
        main_img: "/cards/zombie.png",
        background_img: "/cards/zombie.png",
        third_img: "/cards/zombie.png",
    }, {
        id: 12,
        name: "Enderman",
        description: "Un enderman qui se téléporte",
        category: "Monstre",
        rarity: 4,
        pv_durability: 90,
        cost: 70,
        talent: null,
        attack1: 30,
        attack2: null,
        main_img: "/cards/enderman.png",
        background_img: "/cards/enderman.png",
        third_img: "/cards/enderman.png",
    }, {
        id: 13,
        name: "Creeper",
        description: "Un monstre vert qui explose",
        category: "Monstre",
        rarity: 4,
        pv_durability: 100,
        cost: 50,
        talent: null,
        attack1: 20,
        attack2: null,
        main_img: "/cards/creeper/front.png",
        background_img: "/cards/creeper/back.png",
        third_img: "/cards/creeper/mid.png",
    }, {
        id: 14,
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
        id: 15,
        name: "Zombie",
        description: "Un zombie qui pue",
        category: "Monstre",
        rarity: 1,
        pv_durability: 120,
        cost: 40,
        talent: null,
        attack1: 15,
        attack2: null,
        main_img: "/cards/zombie.png",
        background_img: "/cards/zombie.png",
        third_img: "/cards/zombie.png",
    }, {
        id: 16,
        name: "Enderman",
        description: "Un enderman qui se téléporte",
        category: "Monstre",
        rarity: 4,
        pv_durability: 90,
        cost: 70,
        talent: null,
        attack1: 30,
        attack2: null,
        main_img: "/cards/enderman.png",
        background_img: "/cards/enderman.png",
        third_img: "/cards/enderman.png",
    }, {
        id: 17,
        name: "Creeper",
        description: "Un monstre vert qui explose",
        category: "Monstre",
        rarity: 4,
        pv_durability: 100,
        cost: 50,
        talent: null,
        attack1: 20,
        attack2: null,
        main_img: "/cards/creeper/front.png",
        background_img: "/cards/creeper/back.png",
        third_img: "/cards/creeper/mid.png",
    }, {
        id: 18,
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
        id: 19,
        name: "Zombie",
        description: "Un zombie qui pue",
        category: "Monstre",
        rarity: 1,
        pv_durability: 120,
        cost: 40,
        talent: null,
        attack1: 15,
        attack2: null,
        main_img: "/cards/zombie.png",
        background_img: "/cards/zombie.png",
        third_img: "/cards/zombie.png",
    }, {
        id: 20,
        name: "Enderman",
        description: "Un enderman qui se téléporte",
        category: "Monstre",
        rarity: 4,
        pv_durability: 90,
        cost: 70,
        talent: null,
        attack1: 30,
        attack2: null,
        main_img: "/cards/enderman.png",
        background_img: "/cards/enderman.png",
        third_img: "/cards/enderman.png",
    }
]

export const exampleDeck: Deck = {
    id: 1,
    name: "Deck de démarrage",
    cards: [
        exampleCollectionCards[0],
        exampleCollectionCards[1],
        exampleCollectionCards[2],
        exampleCollectionCards[3],
        exampleCollectionCards[4],
    ]
};