import type { Server, Socket } from "socket.io";
import { playCard } from "../functions/gameLogic";
import { sendGameState } from "../functions/gameLogic";
import { actionList } from "../../data";
import { GameState } from "../../typesPvp";
import { applyCraftTableEffect } from "../functions/testEffectFonctions";

export function playCardSocket(io: Server, socket: Socket, rooms: Map<string, GameState>) {
  socket.on("playCard", ({ cardIndex }) => {
    const roomId = [...socket.rooms].find((r) => r !== socket.id);
    if (!roomId) return;

    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p) => p.id === socket.id);
    if (!player || state.players[state.turnIndex].id !== player.id) {
      return;
    }

    const card = player.hand[cardIndex];
    
    // Calcul du coût réel (incluant Table d'enchantement et Table de craft) pour la vérification
    const realCost = applyCraftTableEffect(player, card, io, roomId, false);
    if (!card) return;
    if (player.energie < realCost) {
      io.to(socket.id).emit("log", "Pas assez d'énergie.");
      return;
    }

    // Vérification de la limite de 3 mobs sur le plateau
    if (card.category === "mob" && player.board.length >= 3) {
      io.to(socket.id).emit("log", "Plateau complet : Vous ne pouvez pas avoir plus de 3 monstres.");
      return;
    }

    // Gérer les équipements qui nécessitent une cible
    if (card.category === "equipement") {
      const availableTargets = player.board
        .map((c, index) => ({ ...c, boardIndex: index }))
        .filter((c) => c.category === "mob" && (!c.equipment || c.equipment.length === 0));

      if (availableTargets.length === 0) {
        const hasMobs = player.board.some((c) => c.category === "mob");
        const msg = hasMobs 
          ? "Tous vos monstres sont déjà équipés (max 1 équipement par monstre)." 
          : "Vous devez avoir un monstre sur le terrain pour jouer un équipement.";
        io.to(socket.id).emit("log", msg);
        return;
      }
      
      // --- NOUVEAU SYSTÈME GÉNÉRIQUE ---
      player.pendingAction = {
        type: "EQUIPMENT",
        sourceHandIndex: cardIndex,
        validTargetIndices: availableTargets.map((t) => t.boardIndex),
        targetPlayerId: player.id, // On cible nos propres cartes
      };

      io.to(socket.id).emit("requestTargetSelection", {
        actionType: "EQUIPMENT",
        cardName: card.name,
        targets: availableTargets,
        message: `Veuillez sélectionner un monstre à équiper avec ${card.name}.`
      });
      return;
    }

    // Gérer les artefacts qui nécessitent une cible (Offensif OU Soutien)
    if (card.category === "artefact") {
      const actionName = card.effet || card.name;
      const actionDef = actionList.find((a) => a.name === actionName);

      if (actionDef && actionDef.requiresTarget) {
        const isEnemyTarget = actionDef.targetType === "enemy";
        const targetPlayer = isEnemyTarget 
            ? state.players.find((p) => p.id !== player.id) 
            : player;
        
        if (!targetPlayer) return;

        const availableTargets = targetPlayer.board
          .map((c, index) => ({ ...c, boardIndex: index }))
          .filter((c) => {
             if (c.category !== "mob") return false;
             // Filtre spécifique pour Lingot de fer : Uniquement les Golems
             if (actionDef.function === "healGolem") return c.name === "Golem";
             // Filtre spécifique pour Portail de l'End
             if (actionDef.function === "healEndCreature") return ["Enderman", "Shulker", "Ender Dragon"].includes(c.name);
             return true;
          });

        if (availableTargets.length === 0) {
          let msg = isEnemyTarget ? "Aucune cible ennemie disponible." : "Aucune cible valide.";
          
          if (actionDef.function === "healGolem") msg = "Pas de golem sur votre plateau.";
          else if (actionDef.function === "healEndCreature") msg = "Pas de créature de l'End sur votre plateau.";
          
          io.to(socket.id).emit("log", msg);
          return;
        }

        // --- NOUVEAU SYSTÈME GÉNÉRIQUE ---
        player.pendingAction = {
          type: isEnemyTarget ? "OFFENSIVE_ARTIFACT" : "SUPPORT_ARTIFACT",
          sourceHandIndex: cardIndex,
          validTargetIndices: availableTargets.map((t) => t.boardIndex),
          targetPlayerId: targetPlayer.id,
        };

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

    const opponent = state.players.find((p) => p.id !== player.id);
    if (!opponent) return;

    const result = playCard(io, roomId, player, card, opponent);
    if (result.success) {
      sendGameState(io, rooms, roomId);
    } else {
      io.to(socket.id).emit("log", result.msg);
    }
  });
}