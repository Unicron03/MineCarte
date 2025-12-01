// === CARTES ===
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

// === JOUEUR ===
export type Player = {
    id: string;
    energie: number;
    pv: number;
    hand: Card[];
    board: Card[];
    deck: Card[];
    discard: Card[];
    turnCount: number;
};

// === ÉTAT DU JEU ===
export type GameState = {
    roomId: string;
    players: Player[];
    turnIndex: number;
};

// === ACTION D'ATTAQUE TEXTUELLE ===
export type Action = {
  name: string;
  description?: string;
  damage: number;
  cost: number;
  multiTarget?: boolean;
  autoActivate?: boolean;
  function?: string;
};

// === CARTE INIT (DB / Builder) ===
export type CardInfo = {
  name: string;
  imageName: string;
  talent?: string;
  attack1?: string;
  attack2?: string;
  baseVie?: number;
  baseCost?: number;
};


// === Liste des actions (exemples) ===
export const actionList: Action[] = [
  { name: "Morsure", damage: 10, cost: 1, description: "Une morsure violente." },
  { name: "Affamé", damage: 5, cost: 0, description: "Attaque faible mais gratuite." },
];

// debug startup
console.log("Server actionList:", actionList.map(a => `${a.name}:${a.damage}`).join(" | "));

// === Liste des cartes ===
export const cardList: CardInfo[] = [
  {
    name: "Zombie",
    imageName: "zombie",
    attack1: "Morsure",
    attack2: "Affamé",
    baseVie: 25,
    baseCost: 1,
  },
  // tu peux en rajouter d'autres
];

export const exampleCollectionCards: Card[] = [
    {
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
        main_img: "/cards/zombie.png",
        background_img: "/cards/zombie.png",
        third_img: "/cards/zombie.png",
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
        id: 6,
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
        id: 7,
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
>>>>>>> develop
