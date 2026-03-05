import { Server, Socket } from "socket.io";
import { GameState, Player, CombatState } from "../../components/utils/typesPvp";
import { sendGameState } from "../functions/gameLogic";
import { getActionList } from "../../../server";
import { applyArtifactDamage, healGolem, halveLifeEffect, discardOwnCard, giveInvisibleEffect, applyBurnEffect, applyGoldenAppleEffect, healEndCreature, applyBellEffect } from "../functions/cartes/artefactFunction";
import { applyCraftTableEffect } from "../functions/testEffectFonctions";

// Gère le socket pour la sélection de cible
export const targetSelectionSocket = (io: Server, socket: Socket, rooms: Map<string, GameState>) => {
  
    // --- Réception du choix du joueur ---
    socket.on("targetSelected", ({ targetIndex }) => {

        // --- Récupération du contexte ---
        let roomId = "";
        let player: Player | undefined;
        let opponent: Player | undefined;

        // --- Recherche du joueur dans les rooms ---
        for (const [rid, state] of rooms.entries()) {
            const p = state.players.find((p) => p.id === socket.id);
            if (p) {
                roomId = rid;
                player = p;
                opponent = state.players.find((op) => op.id !== socket.id);
                break;
            }
        }

        // --- Vérification de l'existence des éléments nécessaires ---
        if (!player || !opponent || !roomId) return;

        // --- Traitement de la sélection ---
        const pending = player.pendingAction;
        if (!pending) {
            socket.emit("error", "Aucune action en attente.");
            return;
        }

        // --- Validation de la cible ---
        if (!pending.validTargetIndices.includes(targetIndex)) {
            socket.emit("error", "Cible invalide.");
            return;
        }

        // --- Exécution de l'action selon le type ---
        const sourceCard = player.hand[pending.sourceHandIndex];

        // --- Calcul du coût final et consommation de l'énergie (Table de Craft, ...) ---
        const finalCost = applyCraftTableEffect(player, sourceCard, io, roomId, true);

        if (player.energie < finalCost) {
            socket.emit("error", "Pas assez d'énergie.");
            player.pendingAction = null;
            return;
        }
        player.energie -= finalCost;
        
        //---  Déterminer le plateau cible (soi-même ou adversaire) ---
        const targetPlayer = pending.targetPlayerId === player.id ? player : opponent;
        const targetCard = targetPlayer.board[targetIndex];

        // --- Vérification de l'existence de la carte cible ---
        if (!targetCard) return;

        // --- Exécution de l'action en fonction du type ---
        switch (pending.type) {
            case "EQUIPMENT":

                // --- Logique d'équipement ---
                if (!targetCard.equipment) targetCard.equipment = [];
                targetCard.equipment.push(sourceCard);
                
                // --- Retirer la carte de la main ---
                player.hand.splice(pending.sourceHandIndex, 1);
                
                io.to(roomId).emit("log", `${player.id} a équipé ${targetCard.name} avec ${sourceCard.name}.`);
                break;

            case "OFFENSIVE_ARTIFACT":

                // --- Récupération de l'action associée à la carte ---
                const actionName = (sourceCard.category === "artefact" ? sourceCard.effet : undefined) || sourceCard.name;
                const actionDef = getActionList().find((a) => a.name === actionName);

                // --- Exécution de l'effet offensif ---
                if (actionDef && actionDef.function === "applyArtifactDamage") {
                    const combatState: CombatState = { log: [] };
                    
                    // --- Appel de la fonction de dégâts d'artefact ---
                    applyArtifactDamage(io, roomId, combatState, opponent, targetIndex, actionDef.damage, sourceCard.name);

                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));

                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);

                // --- Autres effets offensifs d'artefact ---
                } else if (actionDef && actionDef.function === "halveLifeEffect") {
                    const combatState: CombatState = { log: [] };
                    
                    // --- Appel de la fonction de réduction de vie (Ender crystal) ---
                    halveLifeEffect(io, roomId, combatState, opponent, targetIndex, sourceCard.name);

                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
                    
                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);

                // --- Effet de brûlure ---
                } else if (actionDef && actionDef.function === "applyBurnEffect") {
                    const combatState: CombatState = { log: [] };
                    
                    // --- Appel de la fonction de brûlure ---
                    applyBurnEffect(combatState, opponent, targetIndex, sourceCard.name);

                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
                    
                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);
                } else {
                    socket.emit("error", "Effet d'artefact non géré.");
                    return;
                }
                break;

            case "SUPPORT_ARTIFACT":

                // --- Récupération de l'action associée à la carte ---
                const actionNameSupport = (sourceCard.category === "artefact" ? sourceCard.effet : undefined) || sourceCard.name;
                const actionDefSupport = getActionList().find((a) => a.name === actionNameSupport);

                // --- Exécution de l'effet de soutien ---
                if (actionDefSupport && actionDefSupport.function === "healGolem") {
                    const combatState: CombatState = { log: [] };

                    // --- Appel de la fonction de soin du golem ---
                    healGolem(combatState, player, targetIndex, actionDefSupport.damage, sourceCard.name);
                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
                    
                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);

                // --- Autres effets de soutien d'artefact ---
                } else if (actionDefSupport && actionDefSupport.function === "discardOwnCard") {

                    // --- Appel de la fonction de défausse ---
                    const combatState: CombatState = { log: [] };
                    
                    // --- Appel de la fonction de défausse ---
                    discardOwnCard(io, roomId, combatState, player, targetIndex, sourceCard.name);
                    
                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
                    
                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);

                // --- Autres effets de soutien d'artefact ---
                } else if (actionDefSupport && actionDefSupport.function === "giveInvisibleEffect") {

                    // --- Appel de la fonction d'effet invisible ---
                    const combatState: CombatState = { log: [] };
                    
                    // --- Appel de la fonction d'effet invisible ---
                    giveInvisibleEffect(combatState, player, targetIndex, sourceCard.name);
                    
                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
                    
                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);

                // --- Autres effets de soutien d'artefact ---
                } else if (actionDefSupport && actionDefSupport.function === "applyGoldenAppleEffect") {

                    // --- Appel de la fonction d'effet Pomme Dorée ---
                    const combatState: CombatState = { log: [] };
                    
                    // --- Appel de la fonction d'effet Pomme Dorée ---
                    applyGoldenAppleEffect(combatState, player, targetIndex, sourceCard.name);
                    
                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
                    
                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);

                // --- Autres effets de soutien d'artefact ---
                } else if (actionDefSupport && actionDefSupport.function === "healEndCreature") {

                    // --- Appel de la fonction de soin de créature de l'End ---
                    const combatState: CombatState = { log: [] };
                    
                    // --- Appel de la fonction de soin de créature de l'End ---
                    healEndCreature(combatState, player, targetIndex, actionDefSupport.damage, sourceCard.name);
                    
                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
                    
                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);

                } else if (actionDefSupport && actionDefSupport.function === "applyBellEffect") {
                    const combatState: CombatState = { log: [] };

                    // --- Appel de la fonction de la cloche ---
                    applyBellEffect(combatState, player, targetIndex, sourceCard.name);

                    combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));

                    // --- La carte jouée est consommée (dans la défausse) ---
                    player.discard.push(sourceCard);
                    player.hand.splice(pending.sourceHandIndex, 1);
                }
            break;

        }

        // --- Nettoyage et mise à jour ---
        player.pendingAction = null;
        sendGameState(io, rooms, roomId);
    });

    // --- Annulation de la sélection ---
    socket.on("cancelTarget", () => {
        for (const [, state] of rooms.entries()) {
            const player = state.players.find((p) => p.id === socket.id);
            if (player) {
                player.pendingAction = null;
                
                // --- Rembourser le coût si le coût avait été payé avant ---
                socket.emit("log", "Action annulée.");
                return;
            }
        }
    });
};
