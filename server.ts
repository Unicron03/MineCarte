import { createServer } from "http";
import { randomUUID } from "crypto";
import { Server, Socket } from "socket.io";

import { createPlayer, createCard, buildActionList } from "./src/server/functions/builder";
import { sendGameState, handleMatchmaking, applyEnergyGain } from "./src/server/functions/gameLogic";

import { attackSocket } from "./src/server/sockets/attack";
import { playCardSocket } from "./src/server/sockets/playCard";
import { endTurnSocket } from "./src/server/sockets/endTurn";
import { quitSocket } from "./src/server/sockets/quit";
import { disconnectSocket } from "./src/server/sockets/disconnect";
import { targetSelectionSocket } from "./src/server/sockets/targetSelection";
import { useTalentSocket } from "./src/server/sockets/useTalent";
import { appliquerResultatMatch } from "./src/server/functions/gestionVictoire";
import type { GameState, Player, InGameCard, Action } from "./src/components/utils/typesPvp";


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

// --- Actions globales (chargées depuis Prisma) ---
let actionList: Action[] = [];

// --- Fonction pour charger les actions depuis l'API interne (Prisma) ---
async function loadActionsFromAPI(): Promise<Action[]> {
  try {
    const apiUrl = process.env.API_URL || 'http://app:3000';
    console.log(`[Server] Chargement des actions depuis Prisma: ${apiUrl}/api/actions`);
    
    const response = await fetch(`${apiUrl}/api/actions`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const prismaActions = await response.json();
    
    // Transformation des données Prisma en actionList
    // AUCUN mapping en dur - buildActionList utilise directement les données de Prisma
    const actions = buildActionList(prismaActions);
    
    console.log(`[Server] ${actions.length} actions chargées depuis Prisma`);
    console.log(`[Server] Exemple d'action: ${actions[0]?.name} (${actions[0]?.function})`);
    
    return actions;
  } catch (error) {
    console.error('[Server] Erreur lors du chargement des actions depuis Prisma:', error);
    console.error('[Server] Le serveur va démarrer mais les actions seront vides!');
    return [];
  }
}

// --- Initialisation des actions au démarrage ---
async function initializeServer() {
  console.log('[Server] Initialisation du serveur WebSocket...');
  
  // Chargement des actions depuis Prisma (via l'API HTTP interne)
  actionList = await loadActionsFromAPI();
  
  if (actionList.length === 0) {
    console.warn('[Server] ATTENTION: Aucune action chargée depuis Prisma!');
    console.warn('[Server]  Vérifiez que:');
    console.warn('[Server]     1. La migration SQL a été exécutée');
    console.warn('[Server]     2. Le service "app" est démarré et accessible');
    console.warn('[Server]     3. L\'API /api/actions fonctionne');
  }

  // --- Gestion des connexions ---
  io.on("connection", (socket: Socket) => {
    console.log("CONNECT:", socket.id);

    // ENVOI DES ACTIONS AU CLIENT À LA CONNEXION
    socket.emit("actionList", actionList);

    // --- Quand un joueur s'enregistre ---
    socket.on("registerUser", ({ userId, dbUserId, deck }: { userId: string, dbUserId?: string, deck?: any[] }) => {
      // On priorise l'ID de la base de données s'il existe
      const finalUserId = dbUserId || userId;
      (socket as any).userId = finalUserId;
      console.log(`User connecté: ${finalUserId} (socket ${socket.id})`);

      // --- Construction du deck joueur ---
      let playerDeck: InGameCard[] = [];
      if (deck && Array.isArray(deck)) {
          console.log(`[Server] Deck reçu pour ${userId} (${deck.length} cartes)`);
          playerDeck = deck.map((d) => createCard(
              d.name,
              d.imageName,
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

      // 1. Vérifier si le joueur est déjà en jeu (Reconnexion)
      const existing = userToRoom.get(finalUserId);
      if (existing) {
        const { roomId, playerIndex } = existing;
        const state = rooms.get(roomId);
        if (state && state.players[playerIndex]) {
          const player = state.players[playerIndex];
          player.id = socket.id;
          player._disconnectedAt = null;

          socket.join(roomId);
          io.to(roomId).emit("log", "Un joueur s'est reconnecté !");
          sendGameState(io, rooms, roomId);

          io.to(socket.id).emit("roomInfo", { roomId });

          // Si le joueur revient en cours de partie, on vérifie s'il est censé jouer
          const currentTurnPlayer = state.players[state.turnIndex];
          if (currentTurnPlayer.id === socket.id) {
            io.to(socket.id).emit("yourTurnNoAttack");
          } else {
            io.to(socket.id).emit("opponentTurn");
          }

          console.log(` ${finalUserId} reconnecté à ${roomId}`);
          return;
        }
      }

      // 2. Vérifier si le joueur est déjà en file d'attente (Évite double défaite)
      if (waitingPlayer && waitingPlayer.userId === finalUserId) {
        console.log(`[Server] ${finalUserId} est déjà en file d'attente (mise à jour socket)`);
        waitingPlayer.socketId = socket.id;
        waitingPlayer.deck = playerDeck; // Mise à jour du deck au cas où
        // On ne réapplique PAS la défaite ici
        return;
      }

      waitingPlayer = handleMatchmaking(
        io, socket, rooms, waitingPlayer,
        () => randomUUID(), // genToken function
        createPlayer,
        playerDeck, // Deck du joueur courant
        finalUserId, // <-- Ajout crucial pour suivre le joueur en attente
        sendGameState,
        applyEnergyGain
      );

      for (const [roomId, state] of rooms.entries()) {
        state.players.forEach((p: Player, i: number) => {
          if (p.id === socket.id) {
            userToRoom.set(finalUserId, { roomId, playerIndex: i });
          }
        });
      }
    });
    
    playCardSocket(io, socket, rooms);
    targetSelectionSocket(io, socket, rooms);
    useTalentSocket(io, socket, rooms);
    attackSocket(io, socket, rooms, userToRoom);
    endTurnSocket(io, socket, rooms, userToRoom);
    quitSocket(io, socket, rooms, userToRoom);

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
            // L'adversaire gagne (compense sa défaite initiale)
            appliquerResultatMatch(opponent.userId, true).then((result) => {
              console.log(`[Server] Victoire appliquée à ${opponent.userId} (adversaire déconnecté)`);
              io.to(opponent.id).emit("victory", { reason: "opponent_disconnected", ...result });
              io.to(opponent.id).emit("log", "Votre adversaire est parti. Vous avez gagné !");
            });
          }
          rooms.delete(roomId);
          if (p.userId) userToRoom.delete(p.userId);
        }
      }
    }
  }, CHECK_INTERVAL_MS);

  // --- Lancement du serveur WebSocket ---
  httpServer.listen(3002, () => {
    console.log("Serveur WebSocket prêt sur http://localhost:3002");
    console.log(`${actionList.length} actions disponibles (depuis Prisma)`);
  });
}

// --- Export de l'actionList pour les autres modules ---
export function getActionList(): Action[] {
  return actionList;
}


// --- Démarrage du serveur ---
initializeServer().catch((error) => {
  console.error('[Server] Erreur fatale lors de l\'initialisation:', error);
  process.exit(1);
});
