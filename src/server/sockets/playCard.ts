import type { Server, Socket } from "socket.io";
import { playCard } from "../functions/gameLogic";
import { sendGameState } from "../functions/gameLogic";
import { getActionList } from "../../../server";
import { GameState } from "../../components/utils/typesPvp";
import { applyCraftTableEffect } from "../functions/testEffectFonctions";


// Gère le socket pour jouer une carte
export function playCardSocket(io: Server, socket: Socket, rooms: Map<string, GameState>) {
    
    // --- Réception de la carte jouée ---
    socket.on("playCard", ({ cardIndex }) => {

        // --- Récupération du contexte ---
        const roomId = [...socket.rooms].find((r) => r !== socket.id);
        if (!roomId) return;

        const state = rooms.get(roomId); 
        if (!state) return;

        const player = state.players.find((p) => p.id === socket.id);
        if (!player || state.players[state.turnIndex].id !== player.id) {
            return;
        }

        // --- Récupération de la carte jouée ---
        const card = player.hand[cardIndex];
        
        // --- Calcul du coût réel (avec Table de Craft, ...) --- 
        const realCost = applyCraftTableEffect(player, card, io, roomId, false);
        if (!card) return;
        if (player.energie < realCost) {
            io.to(socket.id).emit("log", "Pas assez d'énergie.");
            return;
        }

        // --- Vérification de la limite de 3 mobs sur le plateau ---
        if (card.category === "mob" && player.board.length >= 3) {
            io.to(socket.id).emit("log", "Plateau complet : Vous ne pouvez pas avoir plus de 3 monstres.");
            return;
        }

        // --- Gérer les équipements qui nécessitent une cible ---
        if (card.category === "equipement") {

            // --- Filtrer les cibles valides ---
            const availableTargets = player.board
                .map((c, index) => ({ ...c, boardIndex: index }))
                .filter((c) => c.category === "mob" && (!c.equipment || c.equipment.length === 0));

            // --- Si aucune cible valide ---
            if (availableTargets.length === 0) {
                const hasMobs = player.board.some((c) => c.category === "mob");
                const msg = hasMobs 
                  ? "Tous vos monstres sont déjà équipés (max 1 équipement par monstre)." 
                  : "Vous devez avoir un monstre sur le terrain pour jouer un équipement.";
                io.to(socket.id).emit("log", msg);
                return;
            }

            // --- Enregistrement de l'action en attente ---
            player.pendingAction = {
                type: "EQUIPMENT",
                sourceHandIndex: cardIndex,
                validTargetIndices: availableTargets.map((t) => t.boardIndex),

                // --- Le joueur lui-même est la cible du placement d'équipement ---
                targetPlayerId: player.id, 
            };

            // --- Envoi de la demande de sélection de cible ---
            io.to(socket.id).emit("requestTargetSelection", {
                actionType: "EQUIPMENT",
                cardName: card.name,
                targets: availableTargets,
                message: `Veuillez sélectionner un monstre à équiper avec ${card.name}.`
            });
            return;
        }

        // --- Gérer les artefacts qui nécessitent une cible ---
        if (card.category === "artefact") {
            const actionName = card.effet || card.name;
            const actionDef = getActionList().find((a) => a.name === actionName);

            // --- Si l'action nécessite une cible ---
            if (actionDef && actionDef.requiresTarget) {
                const isEnemyTarget = actionDef.targetType === "enemy";
                const targetPlayer = isEnemyTarget 
                    ? state.players.find((p) => p.id !== player.id) 
                    : player;
                
                // --- Vérification de l'existence du joueur cible ---
                if (!targetPlayer) return;

                // --- Filtrer les cibles valides selon l'effet de l'artefact ---
                const availableTargets = targetPlayer.board
                    .map((c, index) => ({ ...c, boardIndex: index }))
                    .filter((c) => {
                        if (c.category !== "mob") return false; 

                        // --- Filtre spécifique pour Lingot de fer : Uniquement les Golems ---
                        if (actionDef.function === "healGolem") return c.name === "Golem";

                        // --- Filtre spécifique pour Portail de l'End ---
                        if (actionDef.function === "healEndCreature") return ["Enderman", "Shulker", "Ender Dragon"].includes(c.name);
                        return true;
                    });

                // --- Si aucune cible valide ---
                if (availableTargets.length === 0) {
                    let msg = isEnemyTarget ? "Aucune cible ennemie disponible." : "Aucune cible valide.";
                    
                    if (actionDef.function === "healGolem") msg = "Pas de golem sur votre plateau.";
                    else if (actionDef.function === "healEndCreature") msg = "Pas de créature de l'End sur votre plateau.";
                    
                    io.to(socket.id).emit("log", msg);
                    return;
                }

                // --- Enregistrement de l'action en attente ---
                player.pendingAction = {
                    type: isEnemyTarget ? "OFFENSIVE_ARTIFACT" : "SUPPORT_ARTIFACT",
                    sourceHandIndex: cardIndex,
                    validTargetIndices: availableTargets.map((t) => t.boardIndex),
                    targetPlayerId: targetPlayer.id,
                };

                // --- Envoi de la demande de sélection de cible ---
                io.to(socket.id).emit("requestTargetSelection", {
                    actionType: isEnemyTarget ? "OFFENSIVE_ARTIFACT" : "SUPPORT_ARTIFACT",
                    cardName: card.name,
                    targets: availableTargets,
                    message: isEnemyTarget 
                        ? `Sélectionnez une cible ennemie pour ${card.name}.`
                        : `Sélectionnez un allié pour ${card.name}.`
                });
                return;
            }
        }

        // --- Jouer la carte immédiatement (sans cible) ---
        const opponent = state.players.find((p) => p.id !== player.id);
        if (!opponent) return;

        // --- Exécution de la carte ---
        const result = playCard(io, roomId, player, card, opponent);
        if (result.success) {
            sendGameState(io, rooms, roomId);
        } else {
            io.to(socket.id).emit("log", result.msg);
        }
    });
}