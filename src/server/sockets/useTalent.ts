import { Server, Socket } from "socket.io";
import { GameState } from "../../components/utils/typesPvp";
import { getActionList } from "../../../server";
import { sendGameState } from "../functions/gameLogic";
import { checkAndTriggerWarden } from "../functions/testEffectFonctions";
import { peurViscerale } from "../functions/cartes/talentFunction";

// Gère le socket pour utiliser un talent de carte
export const useTalentSocket = (io: Server, socket: Socket, rooms: Map<string, GameState>) => {
    socket.on("useTalent", ({ cardUuid, targetUuid }: { cardUuid: string; targetUuid?: string }) => {
      
        // --- Retrouver la room et le joueur ---
        let roomId = "";
        let playerIndex = -1;

        for (const [rid, state] of rooms.entries()) {
            const idx = state.players.findIndex((p) => p.id === socket.id);
            if (idx !== -1) {
                roomId = rid;
                playerIndex = idx;
                break;
            }
        }

        // --- Vérifier l'existence de la room et du joueur ---
        if (!roomId || playerIndex === -1) return;

        const state = rooms.get(roomId);
        if (!state) return;

        // --- Vérifier que c'est le tour du joueur ---
        if (state.turnIndex !== playerIndex) {
            socket.emit("error", "Ce n'est pas votre tour.");
            return;
        }

        // --- Récupérer le joueur et son adversaire ---
        const player = state.players[playerIndex];
        const opponent = state.players[playerIndex === 0 ? 1 : 0];

        // --- Trouver la carte sur le plateau ---
        const card = player.board.find((c) => c.uuid === cardUuid);
        if (!card || card.category !== "mob") {
            socket.emit("error", "Carte invalide.");
            return;
        }

        // --- Vérifier la disponibilité du talent ---
        if (!card.talent) {
            socket.emit("error", "Cette carte n'a pas de talent.");
            return;
        }

        // --- Vérifier si le talent a déjà été utilisé ce tour ---
        if (card.hasUsedTalent) {
            socket.emit("error", "Talent déjà utilisé ce tour.");
            return;
        }

        // --- Récupérer la définition de l'action ---
        const actionDef = getActionList().find((a) => a.name === card.talent);
        if (!actionDef) {
            socket.emit("error", "Action inconnue.");
            return;
        }

        // --- Si le talent est autoActivate, il ne doit pas être déclenché manuellement via ce socket ---
        if (actionDef.autoActivate) {
            socket.emit("error", "Ce talent s'active automatiquement.");
            return;
        }

        // --- Vérifier le coût en énergie ---
        if (player.energie < actionDef.cost) {
            socket.emit("error", "Pas assez d'énergie.");
            return;
        }

        // --- Exécuter l'effet ---
        let success = false;

        switch (actionDef.function) {
            case "drawCard":
                if (player.deck.length > 0) {
                    const drawn = player.deck.shift();
                    if (drawn) player.hand.push(drawn);
                }
                // --- Succès même si le deck est vide (effet activé) ---
                success = true; 
                break;

            case "heal":
                if (!targetUuid) {
                    socket.emit("error", "Cible requise pour le soin.");
                    return;
                }
                // --- Cherche la cible ---
                const target = player.board.find(c => c.uuid === targetUuid);

                // --- Applique le soin si la cible est valide ---
                if (target && target.category === "mob" && target.pv_durability !== undefined && target.max_pv !== undefined) {
                    const amount = actionDef.damage || 0;
                    target.pv_durability = Math.min(target.pv_durability + amount, target.max_pv);
                    success = true;
                } else {
                    socket.emit("error", "Cible invalide.");
                }
                break;

            case "AttackAllMobs":
                // --- Attaque tous les mobs adverses ---
                opponent.board.forEach(c => {
                    if (c.category === "mob" && c.pv_durability !== undefined) {
                        c.pv_durability -= (actionDef.damage || 0);
                    }
                });
                // Nettoyage des morts
                opponent.board = opponent.board.filter(c => c.category !== "mob" || (c.pv_durability !== undefined && c.pv_durability > 0));
                success = true;
                break;

            case "peurViscerale":
                success = peurViscerale(io, roomId, player, opponent, card);
                break;

            case "defaultFunction":
                socket.emit("error", "Cette fonction n'est pas implémentée.");
                break;

            default:
                socket.emit("error", "Effet non implémenté.");
                break;
        }

        // --- Finaliser ---
        if (success) {
            player.energie -= actionDef.cost;
            card.hasUsedTalent = true;
            io.to(roomId).emit("log", `${player.id} utilise le talent : ${actionDef.name}`);
            
            // --- DÉTECTION SONORE (WARDEN) ---
            checkAndTriggerWarden(io, roomId, player, opponent, card);
            sendGameState(io, rooms, roomId);
        }
    });
};
