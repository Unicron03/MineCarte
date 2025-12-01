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

// --------------- Types pour le PvP ---------------

// Carte pour le combat (PvP)
export type InGameCard = {
    category: "mob";
    name: string;
    imageName: string;
    cost: number;
    pv_durability?: number;
    talent?: string | null;
    attack1?: string | null;
    attack2?:  string | null;
} | {
      category: "equipement" | "artefact";
      name: string;
      cost: number;
      talent?: string;
      attack1?: string;
      attack2?: string;
      pv_durability?: undefined; // interdit d’être défini
};

// Props pour le composant CardPVP (Pvp)
export type CardPVPProps = {
    card: InGameCard;
    clickable?: boolean;
    overrides?: {
        cost?: number;
        pv_durability?: number;
    };
    onTalentClick?: () => void;
    onAttackClick?: (attackName: string) => void;
};

// Joueur (utilisé pour le pvp)
export type Player = {
    id: string;
    energie: number;
    pv: number;
    hand: InGameCard[];
    board: InGameCard[];
    deck: InGameCard[];
    discard: InGameCard[];
    turnCount: number;
    token: string;  // jeton d'authentification
    userId?: string; 
    _disconnectedAt: number | null; 
};

// État du jeu (PvP)
export type GameState = {
    roomId: string;
    players: Player[];
    turnIndex: number;
};

// État du combat (PvP)
export type CombatState = {
    log: string[];
};

// Action d'une carte (PvP)
export type Action = {
    id: number;
    name: string;
    description?: string;
    damage: number;
    cost: number;
    multiTarget?: boolean;
    autoActivate?: boolean;
    function?: string;
};

// Définition d'une attaque (PvP)
export type Attack = {
    cost: number;
    autoActivate?: boolean;
    execute: (
        state: CombatState,
        attacker: InGameCard,
        target: InGameCard | null,
        player: Player,
        opponent: Player
    ) => { killed?: boolean } | void;
};


