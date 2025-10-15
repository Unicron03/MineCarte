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
