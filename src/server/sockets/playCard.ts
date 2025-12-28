import type { Server, Socket } from "socket.io";
import { playCard } from "../functions/gameLogic";
import { sendGameState } from "../functions/gameLogic";
import { actionList } from "../../data";

export function playCardSocket(io: Server, socket: Socket, rooms: Map<string, any>) {
  socket.on("playCard", ({ cardIndex }) => {
    const roomId = [...socket.rooms].find((r) => r !== socket.id);
    if (!roomId) return;

    const state = rooms.get(roomId);
    if (!state) return;

    const player = state.players.find((p: any) => p.id === socket.id);
    if (!player || state.players[state.turnIndex].id !== player.id) {
      return;
    }

    const card = player.hand[cardIndex];
    if (!card || player.energie < card.cost) {
      return;
    }

    // Gérer les équipements qui nécessitent une cible
    if (card.category === "equipement") {
      const availableTargets = player.board
        .map((c: any, index: number) => ({ ...c, boardIndex: index }))
        .filter((c: any) => c.category === "mob");

      if (availableTargets.length === 0) {
        io.to(socket.id).emit("log", "Vous devez avoir un monstre sur le terrain pour jouer un équipement.");
        return;
      }
      player.pendingEquipment = { cardIndex };
      io.to(socket.id).emit("selectTargetForEquipment", {
        cardName: card.name,
        targets: availableTargets,
      });
      io.to(socket.id).emit("log", `Veuillez sélectionner un monstre à équiper avec ${card.name}.`);
      return;
    }

    // Gérer les artefacts offensifs qui nécessitent une cible ennemie (ex: TNT)
    if (card.category === "artefact") {
      const actionName = card.effet || card.name;
      const actionDef = actionList.find((a) => a.name === actionName || a.function === "tntEffect");

      if (actionDef && actionDef.requiresTarget && actionDef.targetType === "enemy") {
        const opponent = state.players.find((p: any) => p.id !== player.id);
        const availableTargets = opponent.board
          .map((c: any, index: number) => ({ ...c, boardIndex: index }))
          .filter((c: any) => c.category === "mob");

        if (availableTargets.length === 0) {
          io.to(socket.id).emit("log", "Aucune cible ennemie disponible.");
          return;
        }

        player.pendingOffensiveArtifact = { cardIndex };
        io.to(socket.id).emit("selectTargetForOffensiveArtifact", {
          cardName: card.name,
          targets: availableTargets,
        });
        io.to(socket.id).emit("log", `Sélectionnez une cible ennemie pour ${card.name}.`);
        return;
      }
    }

    const opponent = state.players.find((p: any) => p.id !== player.id);
    const result = playCard(io, roomId, player, card, opponent);
    if (result.success) {
      sendGameState(io, rooms, roomId);
    }
  });
}