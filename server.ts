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
import type { GameState, Player, InGameCard } from "./src/components/utils/typesPvp";


const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// --- Configuration ---
const CHECK_INTERVAL_MS = 3000;
const GRACE_MS = 5000;
let waitingPlayer: { socketId: string; token: string; userId?: string; deck: InGameCard[] } | null = null;
const rooms: Map<string, GameState> = new Map();
const userToRoom: Map<string, { roomId: string; playerIndex: number }> = new Map();


// --- Gestion des connexions ---
io.on("connection", (socket: Socket) => {
  console.log("CONNECT:", socket.id);

    // --- Quand un joueur s'enregistre ---
  socket.on("registerUser", ({ userId, deck }: { userId: string, deck?: any[] }) => {
    (socket as any).userId = userId;
    console.log(`User connecté: ${userId} (socket ${socket.id})`);

    // --- Construction du deck joueur ---
    let playerDeck: InGameCard[] = [];
    if (deck && Array.isArray(deck)) {
        console.log(`[Server] Deck reçu pour ${userId} (${deck.length} cartes)`);
        playerDeck = deck.map((d) => createCard(
            d.name,
            d.cost,
            d.category,
            d.pv,
            d.talent,
            d.attack1,
            d.attack2
        ));
    } else {
        console.log(`[Server] Pas de deck reçu pour ${userId}, utilisation du deck par défaut.`);
        playerDeck = [];
    }

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
      playerDeck, // Deck du joueur courant
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
  disconnectSocket(io, socket, rooms, userToRoom, () => {
    if (waitingPlayer && waitingPlayer.socketId === socket.id) {
      waitingPlayer = null;
    }
  });

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
httpServer.listen(3002, () => {
  console.log(" Serveur WebSocket prêt sur http://localhost:3002");
});
