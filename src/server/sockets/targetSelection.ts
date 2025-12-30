// c:\Users\johnm\Documents\BUT\SAE\minecarte\src\server\sockets\targetSelection.ts

import { Server, Socket } from "socket.io";
import { GameState, Player, CombatState } from "../../typesPvp";
import { sendGameState } from "../functions/gameLogic";
import { actionList } from "../../data";
import { applyArtifactDamage, healGolem, halveLifeEffect, discardOwnCard } from "../functions/cartes/artefactFunction";
import { applyCraftTableEffect } from "../functions/testEffectFonctions";

export const targetSelectionSocket = (
  io: Server,
  socket: Socket,
  rooms: Map<string, GameState>
) => {
  
  // --- Réception du choix du joueur ---
  socket.on("targetSelected", ({ targetIndex }) => {
    // 1. Récupération du contexte
    let roomId = "";
    let player: Player | undefined;
    let opponent: Player | undefined;

    // Recherche du joueur dans les rooms (optimisable avec userToRoom)
    for (const [rid, state] of rooms.entries()) {
      const p = state.players.find((p) => p.id === socket.id);
      if (p) {
        roomId = rid;
        player = p;
        opponent = state.players.find((op) => op.id !== socket.id);
        break;
      }
    }

    if (!player || !opponent || !roomId) return;

    const pending = player.pendingAction;
    if (!pending) {
      socket.emit("error", "Aucune action en attente.");
      return;
    }

    // 2. Validation de la cible
    if (!pending.validTargetIndices.includes(targetIndex)) {
      socket.emit("error", "Cible invalide.");
      return;
    }

    // 3. Exécution de l'action selon le type
    const sourceCard = player.hand[pending.sourceHandIndex];

    // Calcul du coût final et consommation de l'énergie (et des effets comme Table de Craft)
    const finalCost = applyCraftTableEffect(player, sourceCard, io, roomId, true);

    if (player.energie < finalCost) {
      socket.emit("error", "Pas assez d'énergie.");
      player.pendingAction = null;
      return;
    }
    player.energie -= finalCost;
    
    // Déterminer le plateau cible (soi-même ou adversaire)
    const targetPlayer = pending.targetPlayerId === player.id ? player : opponent;
    const targetCard = targetPlayer.board[targetIndex];

    if (!targetCard) return;

    switch (pending.type) {
      case "EQUIPMENT":
        // Logique d'équipement
        if (!targetCard.equipment) targetCard.equipment = [];
        targetCard.equipment.push(sourceCard);
        
        // Retirer la carte de la main
        player.hand.splice(pending.sourceHandIndex, 1);
        
        io.to(roomId).emit("log", `${player.id} a équipé ${targetCard.name} avec ${sourceCard.name}.`);
        break;

      case "OFFENSIVE_ARTIFACT":
        // Récupération de l'action associée à la carte
        const actionName = (sourceCard.category === "artefact" ? sourceCard.effet : undefined) || sourceCard.name;
        const actionDef = actionList.find((a) => a.name === actionName);

        if (actionDef && actionDef.function === "applyArtifactDamage") {
            const combatState: CombatState = { log: [] };
            
            // Appel de la fonction générique
            applyArtifactDamage(io, roomId, combatState, opponent, targetIndex, actionDef.damage, sourceCard.name);

            combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));

            // La carte jouée est consommée (mise au cimetière)
            player.discard.push(sourceCard);
            player.hand.splice(pending.sourceHandIndex, 1);
        } else if (actionDef && actionDef.function === "halveLifeEffect") {
            const combatState: CombatState = { log: [] };
            
            halveLifeEffect(io, roomId, combatState, opponent, targetIndex, sourceCard.name);

            combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
            
            player.discard.push(sourceCard);
            player.hand.splice(pending.sourceHandIndex, 1);
        } else {
            socket.emit("error", "Effet d'artefact non géré.");
            return;
        }
        break;

      case "SUPPORT_ARTIFACT":
        const actionNameSupport = (sourceCard.category === "artefact" ? sourceCard.effet : undefined) || sourceCard.name;
        const actionDefSupport = actionList.find((a) => a.name === actionNameSupport);

        if (actionDefSupport && actionDefSupport.function === "healGolem") {
             const combatState: CombatState = { log: [] };
             // targetPlayer ici est le joueur lui-même (player) car c'est un sort allié
             healGolem(io, roomId, combatState, player, targetIndex, actionDefSupport.damage, sourceCard.name);
             combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
             
             player.discard.push(sourceCard);
             player.hand.splice(pending.sourceHandIndex, 1);
        } else if (actionDefSupport && actionDefSupport.function === "discardOwnCard") {
             const combatState: CombatState = { log: [] };
             
             discardOwnCard(io, roomId, combatState, player, targetIndex, sourceCard.name);
             
             combatState.log.forEach((msg) => io.to(roomId).emit("log", msg));
             
             player.discard.push(sourceCard);
             player.hand.splice(pending.sourceHandIndex, 1);
        }
        break;

      // Ajouter d'autres cas ici (SPELL, ATTACK...)
    }

    // 4. Nettoyage et mise à jour
    player.pendingAction = null;
    sendGameState(io, rooms, roomId);
  });

  // --- Annulation de la sélection ---
  socket.on("cancelTarget", () => {
    for (const [rid, state] of rooms.entries()) {
      const player = state.players.find((p) => p.id === socket.id);
      if (player) {
        player.pendingAction = null;
        // Optionnel : Rembourser le coût si le coût avait été payé avant
        socket.emit("log", "Action annulée.");
        return;
      }
    }
  });
};
