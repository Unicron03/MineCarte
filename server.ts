
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import crypto from "crypto";

import { createPlayer, createCard } from "./functions/PvP/builder";
import { drawCard, playCard, endTurn, sendGameState, handleMatchmaking, applyEnergyGain, checkVictory } from "./functions/PvP/gameLogic";

import { actionList} from "./src/types";

import { attackList } from "./functions/PvP/attackList";
import { CombatState } from "./functions/PvP/combatActions";

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

// --- Configuration ---
const CHECK_INTERVAL_MS = 3000;
const GRACE_MS = 5000;
let waitingPlayer: any = null;
const rooms: Map<string, any> = new Map();
const userToRoom: Map<string, any> = new Map();

// --- Fonction utilitaire ---
const genToken = (): string => crypto.randomBytes(8).toString("hex");




// <---------------------- Temporaire ---------------------- (je crée les deck au lieu de les récupérer dans la BDD)
const baseDeck1 = [
  createCard("Zombie", 1, "", "morsure", "affame", 25),
  createCard("Zombie", 1, "", "morsure", "affame", 25),
  createCard("Zombie", 1, "", "morsure", "affame", 25),
  createCard("Zombie", 1, "", "morsure", "affame", 25),
  createCard("Zombie", 1, "", "morsure", "affame", 25),
  createCard("Zombie", 1, "", "morsure", "affame", 25),
];
const baseDeck2 = [...baseDeck1];
// <------------------------------------------------------




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
      genToken, createPlayer, 
      baseDeck1, baseDeck2,
      sendGameState,
      applyEnergyGain
    );


    for (const [roomId, state] of rooms.entries()) {
      state.players.forEach((p: any, i: number) => {
        if (p.id === socket.id) {
          userToRoom.set(userId, { roomId, playerIndex: i });
        }
      });
    }
  });



    // --- Quand un joueur joue une carte ---
  socket.on("playCard", ({ roomId, card }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    const current = state.players[state.turnIndex];
    if (socket.id !== current.id) {
      socket.emit("log", "Ce n’est pas ton tour !");
      return;
    }

    const result = playCard(current, card);
    socket.emit("log", result.msg);
    if (result.success) sendGameState(io, rooms, roomId);
  });



  // --- Quand un joueur attaque --- (Modifier pour dirrectement récuprerer la fonction d'attaque)
  socket.on("attack", ({ roomId, attackerIndex, attackName, targetIndex }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const playerIndex = room.players.findIndex((p: any) => p.id === socket.id);
    if (playerIndex === -1) {
      socket.emit("log", "Joueur introuvable dans la room.");
      return;
    }

    const opponentIndex = playerIndex === 0 ? 1 : 0;
    const player = room.players[playerIndex];
    const opponent = room.players[opponentIndex];

    const attacker = player.board[attackerIndex];
    if (!attacker) {
      socket.emit("log", "Carte attaquante invalide.");
      return;
    }

    const attack = attackList[attackName.toLowerCase()];
    if (!attack) {
      socket.emit("log", ` Attaque inconnue : ${attackName}`);
      return;
    }

    const state: CombatState = { log: [] };

    const target =
      targetIndex !== null &&
      targetIndex !== undefined &&
      opponent.board[targetIndex]
        ? opponent.board[targetIndex]
        : null;

    // Appel correct avec 5 paramètres
    const result = attack.execute(state, attacker, target, player, opponent);

    // Si la cible est morte
    if (result?.killed && target && targetIndex !== null) {
      opponent.discard.push(target);
      opponent.board.splice(targetIndex, 1);
      state.log.push(` ${target.name} est détruite !`);
    }

    // Log des actions
    state.log.forEach(msg => io.to(roomId).emit("log", msg));

    sendGameState(io, rooms, roomId);

    // Check victory
    const victory = checkVictory(io, room, rooms);
    if (victory) return;

  });


  // ------------





  // --- Quand un joueur termine son tour ---
  socket.on("endTurn", ({ roomId }) => {
    const state = rooms.get(roomId);
    if (!state) return;
    endTurn(io, rooms, state);

    const current = state.players[state.turnIndex];
    const opponent = state.players.find((p: any) => p.id !== current.id);

    io.to(current.id).emit("yourTurn");
    io.to(opponent.id).emit("opponentTurn");
  });

  // --- Quand un joueur veut quitter la partie  ---
  socket.on("quit", ({ roomId }) => {
    const state = rooms.get(roomId);
    if (!state) return;
    const quitter = state.players.find((p: any) => p.id === socket.id);
    const opponent = state.players.find((p: any) => p.id !== socket.id);
    if (opponent) {
      io.to(opponent.id).emit("victory", { reason: "opponent_quit" });
      io.to(opponent.id).emit("log", "Votre adversaire a quitté. Vous avez gagné !");
    }
    rooms.delete(roomId);
  });

  // --- Gestion de la déconnexion ---
  socket.on("disconnect", () => {
    console.log("DISCONNECT:", socket.id);
    for (const [roomId, state] of rooms.entries()) {
      const playerIndex = state.players.findIndex((p: any) => p.id === socket.id);
      if (playerIndex !== -1) {
        const player = state.players[playerIndex];
        player._disconnectedAt = Date.now();
        if (player.userId) {
          userToRoom.set(player.userId, { roomId, playerIndex });
        } else if ((socket as any).userId) {
          userToRoom.set((socket as any).userId, { roomId, playerIndex });
        }
        const opponent = state.players.find((p: any) => p.id !== socket.id);
        if (opponent) io.to(opponent.id).emit("log", "Votre adversaire est déconnecté...");
        return;
      }
    }
    if (waitingPlayer && waitingPlayer.socketId === socket.id) waitingPlayer = null;
  });
});

// --- Vérification des déconnexions prolongées --- (GRACE_MS = 5s)
setInterval(() => {
  const now = Date.now();
  for (const [roomId, state] of rooms.entries()) {
    for (const p of state.players) {
      const s = io.sockets.sockets.get(p.id);
      const connected = s && s.connected;
      if (!connected && p._disconnectedAt && now - p._disconnectedAt > GRACE_MS) {
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
