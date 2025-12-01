import { Server, Socket } from "socket.io";
import type { InGameCard, Player } from "../../src/types";


// --- Piocher une carte ---
export function drawCard(player: Player) {
  const card = player.deck.shift();
  if (!card) {
    console.warn("drawCard: deck vide ou erreur shift()");
    return;
  }
  player.hand.push(card);
}


// --- Jouer une carte ---
export function playCard(player: Player, card: InGameCard) {
  if (!card) return { success: false, msg: "Carte invalide." };

  const found = player.hand.find((c) => c.name === card.name);
  if (!found) return { success: false, msg: "Carte non trouvée en main." };

  if (found.cost > player.energie) {
    return { success: false, msg: "Pas assez d’énergie." };
  }

  player.energie -= found.cost;

  let cardToPlay: InGameCard;

  // === CAS 1 : MOB ===
  if (found.category === "mob") {
    cardToPlay = {
      ...found,
      pv_durability: found.pv_durability ?? 0, // obligatoire pour mob
      attack1: found.attack1 ? capitalize(found.attack1) : "",
      attack2: found.attack2 ? capitalize(found.attack2) : null,
    };
  }

  // === CAS 2 : ARTEFACT / EQUIPEMENT ===
  else {
    cardToPlay = {
      ...found,
      attack1: found.attack1 ? capitalize(found.attack1) : undefined,
      attack2: found.attack2 ? capitalize(found.attack2) : undefined,
    };
  }

  // Retirer de la main et poser sur le board
  player.hand = player.hand.filter((c) => c !== found);
  player.board.push(cardToPlay);

  return { success: true, msg: `Vous avez joué ${found.name}` };
}


// --- Première lettre en majuscule, le reste en minuscule ---
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

// --- Terminer le tour ---
export function endTurn(io: Server, rooms: Map<string, any>, state: any) {
  state.turnIndex = (state.turnIndex + 1) % 2;
  const current = state.players[state.turnIndex];
  // on incrémente ici pour indiquer que le joueur "commence" un nouveau tour
  if (current.turnCount === undefined) current.turnCount = 0;
  current.turnCount++;
  // appliquer le gain d'énergie correctement (isSecondPlayer = index === 1)
  const isSecondPlayer = state.turnIndex === 1;
  const { gain } = applyEnergyGain(current, isSecondPlayer);
  // pioche et envoi d'état
  drawCard(current);
  io.to(state.roomId).emit(
    "log",
    `Tour de ${current.id} → +${gain} énergie (total: ${current.energie})`
  );
  sendGameState(io, rooms, state.roomId);
  if (checkVictory(io, state, rooms)) return;
}

// --- Envoyer l'état du jeu ---
export function sendGameState(io: Server, rooms: Map<string, any>, roomId: string) {
  const state = rooms.get(roomId);
  if (!state) return;

  for (const player of state.players) {
    const opponent = state.players.find((p: any) => p.id !== player.id);

    const visibleState = {
      selfId: player.id,
      roomId: state.roomId,
      turnIndex: state.turnIndex,
      players: [
        {
          id: player.id,
          energie: player.energie,
          deck: player.deck,
          hand: player.hand,
          board: player.board,
          discard: player.discard,
          pv: player.pv,
        },
        opponent
          ? {
              id: opponent.id,
              energie: opponent.energie,
              deck: new Array(opponent.deck.length).fill({ hidden: true }),
              hand: new Array(opponent.hand.length).fill({ hidden: true }),
              board: opponent.board,
              discard: opponent.discard,
              pv: opponent.pv,
            }
          : null,
      ],
    };
    
    io.to(player.id).emit("updateState", visibleState);
  }
}

// --- Gérer le matchmaking ---
export function handleMatchmaking(
  io: Server,
  socket: Socket,
  rooms: Map<string, any>,
  waitingPlayer: any,
  genToken: () => string,
  createPlayer: any,
  baseDeck1: any[],
  baseDeck2: any[],
  sendGameState: any,
  applyEnergyGain: any
): any {
  if (waitingPlayer) {
    const waitingSock = io.sockets.sockets.get(waitingPlayer.socketId);
    if (waitingSock && waitingSock.connected) {
      const roomId = `room-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

      socket.join(roomId);
      waitingSock.join(roomId);

      const token1 = waitingPlayer.token;
      const token2 = genToken();

      const p1 = createPlayer(waitingPlayer.socketId, baseDeck1, token1, waitingPlayer.userId);
      const p2 = createPlayer(socket.id, baseDeck2, token2, (socket as any).userId);

      p1.turnCount = 1; // J1 commence déjà son premier tour
      p2.turnCount = 0;

      // J1 commence → gagne 1 énergie dès le début
      applyEnergyGain(p1, false);


      const state = {
        roomId,
        players: [p1, p2],
        turnIndex: 0, 
      };

      rooms.set(roomId, state);

      // Info room + token
      io.to(p1.id).emit("roomInfo", { roomId, token: token1 });
      io.to(p2.id).emit("roomInfo", { roomId, token: token2 });

      io.to(roomId).emit("gameStart");

      // J1 commence son tour
      io.to(p1.id).emit("yourTurn");
      io.to(p2.id).emit("opponentTurn"); 

      // envoyer état après énergie initiale
      sendGameState(io, rooms, roomId);

      console.log(` Room créée: ${roomId}`);
      return null;
    } else {
      const newWaiting = { socketId: socket.id, token: genToken(), userId: (socket as any).userId };
      socket.emit("waiting");
      console.log(` Nouveau joueur en attente: ${socket.id}`);
      return newWaiting;
    }
  } else {
    const newWaiting = { socketId: socket.id, token: genToken() };
    socket.emit("waiting");
    console.log(` Joueur en attente: ${socket.id}`);
    return newWaiting;
  }
}

// --- Gestion du gain d'énergie par tour ---
export function applyEnergyGain(player: any, isSecondPlayer: boolean) {
  // sécurités
  if (!player) throw new Error("applyEnergyGain: player manquant");
  if (player.turnCount === undefined) player.turnCount = 0;
  if (player.energie === undefined) player.energie = 0;

  const baseStart = isSecondPlayer ? 2 : 1; // J2 commence avec +2, J1 commence +1

  // On suppose que player.turnCount a déjà été incrémenté pour ce tour
  // gain = baseStart + (turnCount - 1) * 2, plafonné à 5
  const gain = Math.min(baseStart + Math.max(0, player.turnCount - 1) * 2, 5);

  const before = player.energie;
  player.energie = Math.min(player.energie + gain, 20); // cumul, cap 20

  return { gain, before, after: player.energie };
}

// --- Vérification de la victoire ---
export function checkVictory(io: any, roomState: any, rooms: Map<string, any>) {
  const [p1, p2] = roomState.players;

  if (p1.pv <= 0 && p2.pv <= 0) {
    io.to(roomState.roomId).emit("draw");
    rooms.delete(roomState.roomId);
    return true;
  }

  if (p1.pv <= 0) {
    io.to(p1.id).emit("defeat", { reason: "pv_zero" });
    io.to(p2.id).emit("victory", { reason: "enemy_zero" });
    rooms.delete(roomState.roomId);
    return true;
  }

  if (p2.pv <= 0) {
    io.to(p2.id).emit("defeat", { reason: "pv_zero" });
    io.to(p1.id).emit("victory", { reason: "enemy_zero" });
    rooms.delete(roomState.roomId);
    return true;
  }

  return false;
}
