
import { createServer } from "http";
import { randomUUID } from "crypto";
import { Server, Socket } from "socket.io";

import { createPlayer, createCard } from "./src/server/functions/builder";
import { sendGameState, handleMatchmaking, applyEnergyGain } from "./src/server/functions/gameLogic";

import { attackSocket } from "./src/server/sockets/attack";
import { playCardSocket } from "./src/server/sockets/playCard";
import { endTurnSocket } from "./src/server/sockets/endTurn";
import { quitSocket } from "./src/server/sockets/quit";
import { disconnectSocket } from "./src/server/sockets/disconnect";
import { targetSelectionSocket } from "./src/server/sockets/targetSelection";
import { useTalentSocket } from "./src/server/sockets/useTalent";
import type { GameState, Player } from "./src/typesPvp";


const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// --- Configuration ---
const CHECK_INTERVAL_MS = 3000;
const GRACE_MS = 5000;
let waitingPlayer: Player | null = null;
const rooms: Map<string, GameState> = new Map();
const userToRoom: Map<string, { roomId: string; playerIndex: number }> = new Map();


// --- Définition des decks de base ---
const baseDeck1 = [
  createCard("Zombie", 1, "mob", 25, null, "Morsure", "Affamé"),
  createCard("Gast", 1, "mob", 45, null, "Téléportation Furtive","Explosion"),
  createCard("Table de craft", 1, "artefact", null, "Table de craft", null, null),
  createCard("Zombie", 1, "mob", 25, null, "Morsure", "Affamé"),
  createCard("Enderman", 1, "mob", 45, "Téléportation", "Coup d'ombre", "Soin"),
  createCard("Villageois", 1, "mob", 15, null, "Tir de précision", null),
  createCard("Golem", 3, "mob", 55, "Gardien du Village", "Morsure", "Affamé"),
  createCard("Enderman", 1, "mob", 45, "Téléportation", "Coup d'ombre", "Soin"),
  createCard("Armure", 2, "equipement", 10, null, null, null),
  createCard("Potion", 2, "equipement", 10, "Potion", null, null),
  createCard("Lit", 2, "artefact", null, "Lit", null, null),
  createCard("Livre", 1, "artefact", null, "Livre", null, null),
  createCard("TNT", 2, "artefact", null, "TNT", null, null),
  createCard("Lingot de fer", 1, "artefact", null, "Lingot de fer", null, null),
  createCard("End Crystal", 2, "artefact", null, "End Crystal", null, null),
  createCard("Ender Pearl", 2, "artefact", null, "Ender Pearl", null, null),
];

const baseDeck2 = [...baseDeck1];



// --- Gestion des connexions ---
io.on("connection", (socket: Socket) => {
  console.log("CONNECT:", socket.id);

    // --- Quand un joueur s'enregistre ---
  socket.on("registerUser", ({ userId }) => {
    (socket as any).userId = userId;
    console.log(`User connecté: ${userId} (socket ${socket.id})`);

    const existing = userToRoom.get(userId);
    if (existing) {
      const { roomId, playerIndex } = existing;
      const state = rooms.get(roomId);
      if (state && state.players[playerIndex]) {
        const player = state.players[playerIndex];
        player.id = socket.id;
        player._disconnectedAt = null;

        socket.join(roomId);
        io.to(roomId).emit("log", "Un joueur s’est reconnecté !");
        sendGameState(io, rooms, roomId);

        io.to(socket.id).emit("roomInfo", { roomId });

        // Si le joueur revient en cours de partie, on vérifie s'il est censé jouer
        const currentTurnPlayer = state.players[state.turnIndex];
        if (currentTurnPlayer.id === socket.id) {
          io.to(socket.id).emit("yourTurnNoAttack");
        } else {
          io.to(socket.id).emit("opponentTurn");
        }


        console.log(` ${userId} reconnecté à ${roomId}`);
        return;
      }
    }

    waitingPlayer = handleMatchmaking(
      io, socket, rooms, waitingPlayer,
      () => randomUUID(), // genToken function
      createPlayer,
      baseDeck1, baseDeck2,
      sendGameState,
      applyEnergyGain
    );


    for (const [roomId, state] of rooms.entries()) {
      state.players.forEach((p: Player, i: number) => {
        if (p.id === socket.id) {
          userToRoom.set(userId, { roomId, playerIndex: i });
        }
      });
    }
  });
  playCardSocket(io, socket, rooms);

  // --- Gestion générique de la sélection de cible ---
  targetSelectionSocket(io, socket, rooms);

  // --- Quand le client veut utiliser un talent ---
  useTalentSocket(io, socket, rooms);

  // --- Quand le client envoit attack  ---
  attackSocket(io, socket, rooms);

  // --- Quand un joueur termine son tour ---
  endTurnSocket(io, socket, rooms);

  // --- Quand un joueur veut quitter la partie  ---
  quitSocket(io, socket, rooms);

  // --- Gestion de la déconnexion ---
  disconnectSocket(io, socket, rooms, userToRoom, waitingPlayer);

});

// --- Vérification des déconnexions prolongées --- (GRACE_MS = 5s)
setInterval(() => {
  const now = Date.now();
  for (const [roomId, state] of rooms.entries()) {
    for (const p of state.players) {
      const s = io.sockets.sockets.get(p.id);
      const connected = s && s.connected;
      if (!connected && p._disconnectedAt && (now - p._disconnectedAt > GRACE_MS)) {
        const opponent = state.players.find((x: any) => x.id !== p.id);
        if (opponent) {
          io.to(opponent.id).emit("victory", { reason: "opponent_disconnected" });
          io.to(opponent.id).emit("log", "Votre adversaire est parti. Vous avez gagné !");
        }
        rooms.delete(roomId);
        if (p.userId) userToRoom.delete(p.userId);
      }
    }
  }
}, CHECK_INTERVAL_MS);

// --- Lancement du serveur WebSocket ---
httpServer.listen(3001, () => {
  console.log(" Serveur WebSocket prêt sur http://localhost:3001");
});
