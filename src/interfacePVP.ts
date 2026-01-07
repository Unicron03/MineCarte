import { InGameCard, Player } from "./typesPvp";

// Props pour le composant CardPVP
export interface CardPVPProps {
    card: InGameCard;
    clickable?: boolean;
    isPlayer?: boolean;
    overrides?: {
        cost?: number;
        pv_durability?: number;
    };
    onTalentClick?: () => void;
    onAttackClick?: (attackName: string) => void;
    onClick?: () => void;
    onEffectClick?: (effectName: string) => void;
    onEquipmentClick?: (equipment: InGameCard) => void;
}

// Props pour le composant AlertPopup
export interface AlertPopupProps {
  message: string | null;
  isOpen: boolean;
  onClose: () => void;
}

// Props pour le composant CardPVPHand
export interface CardPVPHandProps {
  card: InGameCard;
  onClick?: () => void;
  style?: React.CSSProperties;
  className?: string;
  hideStats?: boolean;
}

// Props pour le composant DiscardPile
export interface DiscardPileProps {
  cards: InGameCard[];
  style?: React.CSSProperties;
  className?: string;
  label?: string;
}

// Props pour le composant EffectDetailsModal
export interface EffectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  imageName?: string; // Nom de l'image pour l'icône 
  type: "effect" | "equipment" | "talent";
};

// Props pour le composant EffectDisplay
export interface EffectDisplayProps {
    title: string;
    effects?: string[]; // Liste des descriptions d'effets 
    isSelf: boolean;    // true pour le joueur actuel (vert), false pour l'adversaire (rouge)
}

// Props pour le composant EndGameScreen
export interface EndGameScreenProps {
  result: "win" | "lose" | "draw";
  onQuit: () => void;
}

// Props pour le composant GameLogs
export interface GameLogsProps {
  logs: string[];
}

// Props pour le composant LeftPanel
export interface LeftPanelProps {
  me: Player | null;
  opponent: Player | null;
  onQuit: () => void;
  onEffectClick?: (effectName: string) => void;
}

// Props pour le composant PlayerHand
export interface PlayerHandProps {
  hand: InGameCard[];
  onPlayCard: (index: number) => void;
  isMyTurn: boolean;
  selectionMode: 'none' | 'ally' | 'enemy';
}

// Props pour le composant SelectionModal
export type SelectionModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  targets: (InGameCard & { boardIndex: number })[]; // index du plateau
  onSelect: (targetIndex: number) => void;
  onCancel: () => void;
  borderColor?: string; // jaune ou rouge
};

// Props pour le composant TurnIndicator
export interface TurnIndicatorProps {
  isMyTurn: boolean;
}