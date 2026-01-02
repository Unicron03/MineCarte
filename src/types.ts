// Cartes dans la collection (hors combat)
export type CollectionCard = {
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
    cards: CollectionCard[];
};
