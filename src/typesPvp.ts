// Carte pour le combat (union) 
export type InGameCard = {
    uuid: string;
    category: "mob";
    name: string;
    imageName: string;
    cost: number;
    pv_durability?: number;
    max_pv?: number;
    hasAttacked?: boolean;
    hasUsedTalent?: boolean;
    talent?: string | null;
    attack1?: string | null;
    attack2?:  string | null;
    equipment?: InGameCard[];
    effects?: string[];
} | {
      uuid: string;
      category: "equipement" | "artefact";
      name: string;
      cost: number;
      imageName: string;
      effet?: string;
      effects?: undefined;
      equipment?: undefined;
      pv_durability?: undefined;
      max_pv?: undefined;
      hasAttacked?: undefined;
      hasUsedTalent?: undefined;
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
    onClick?: () => void;
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
    effects?: string[];
    pendingEquipment?: { cardIndex: number };
    pendingOffensiveArtifact?: { cardIndex: number };
    _disconnectedAt: number | null; 
};

// État du jeu (PvP)
export type GameState = {
    roomId: string;
    players: Player[]; // liste des joueurs
    turnIndex: number; // à qui le tour
};

// Action d'une carte (PvP)
export type Action = {
    id: number;
    name: string;
    description?: string;
    damage: number;
    cost: number;
    multiTarget?: boolean;
    requiresTarget?: boolean;
    autoActivate?: boolean;
    function?: string;
    targetType?: "ally" | "enemy";
};


// État du combat (PvP)
export type CombatState = {
    log: string[];
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

export type AttackSelection = {
    attackerIndex: number;
    attackName: string | null;
};
