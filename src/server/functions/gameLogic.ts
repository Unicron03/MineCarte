import { Server, Socket } from "socket.io";
import type { InGameCard, Player, Action } from "../../typesPvp";
import { actionList } from "../../data";
import { applyCraftTableEffect, checkVillageGuardian } from "./testEffectFonctions";


// --- Piocher une carte ---
export function drawCard(player: Player) {
  const card = player.deck.shift();
  if (!card) {
    console.warn("drawCard: deck vide");
    return;
  }
  player.hand.push(card);
}

// --- Jouer une carte ---
export function playCard(io: Server, roomId: string, player: Player, card: InGameCard, opponent: Player) {
  if (!card) return { success: false, msg: "Carte invalide." };

  // Utiliser l'index pour trouver et retirer la carte de manière fiable
  const cardIndex = player.hand.findIndex((c) => c.uuid === card.uuid);
  if (cardIndex === -1) return { success: false, msg: "Carte non trouvée en main." };
  
  const found = player.hand[cardIndex];

  let finalCost = found.cost;
  
  // On clone la carte pour éviter les problèmes de référence partagée
  const cardToPlay = JSON.parse(JSON.stringify(found));

  // --- EQUIPEMENT ---
  if (found.category === "equipement") {
    return { success: false, msg: "L'action pour équiper est invalide ici." };
  }

  // --- ARTEFACT ---
  if (found.category === "artefact") {
    finalCost = applyCraftTableEffect(player, found, io, roomId, false); // Simulation

    if (player.energie < finalCost) {
      return { success: false, msg: "Pas assez d'énergie." };
    }
    // Application réelle de l'effet (consommation)
    applyCraftTableEffect(player, found, io, roomId, true);

    if (found.effet) {
      const action = actionList.find(a => a.name === found.effet);
      if (action) {
        if (!player.effects) player.effects = [];
        console.log(`[DEBUG] Avant ajout: player.effects = ${JSON.stringify(player.effects)}`);
        player.effects.push(action.name);
        console.log(`[DEBUG] Après ajout: player.effects = ${JSON.stringify(player.effects)}`);
        io.to(roomId).emit("log", `[Effet] ${player.id} active ${action.name}.`);
      }
    }
    // L'artefact est consommé et va dans la défausse
    player.discard.push(cardToPlay);
    // On retire la carte de la main
    player.hand.splice(cardIndex, 1);
    // On paie le coût de l'artefact
    player.energie -= finalCost;
    return { success: true, msg: `Vous avez joué ${found.name}`, update: true };
  }

  // Pour les mobs, on vérifie d'abord les effets actifs
  finalCost = applyCraftTableEffect(player, found, io, roomId, false); // Simulation

  if (player.energie < finalCost) {
    return { success: false, msg: "Pas assez d'énergie." };
  }
  // Application réelle de l'effet (consommation)
  applyCraftTableEffect(player, found, io, roomId, true);
  player.energie -= finalCost;

  if (found.category === "mob") {
    player.board.push(cardToPlay);
    
    // Vérification des synergies passives (ex: Golem + Villageois)
    checkVillageGuardian(player, io, roomId);
  } else if (found.category === "equipement") {
    // La logique d'équipement est gérée dans playCardSocket, cette partie ne devrait pas être atteinte.
  } else {
    return { success: false, msg: `Catégorie de carte non reconnue pour l'action.`};
  }

  // Retirer de la main du joueur
  player.hand.splice(cardIndex, 1);
  
  return { success: true, msg: `Vous avez joué ${found.name}` };
}

// --- Jouer un équipement (Nouvelle fonction centralisée) ---
export function playEquipment(
  io: Server,
  roomId: string,
  player: Player,
  card: InGameCard,
  targetMob: InGameCard
) {
  // Validation de base
  const cardIndex = player.hand.findIndex((c) => c.uuid === card.uuid);
  if (cardIndex === -1) return { success: false, msg: "Carte non trouvée en main." };
  
  const found = player.hand[cardIndex];
  if (found.category !== "equipement") return { success: false, msg: "Ce n'est pas un équipement." };
  if (targetMob.category !== "mob") return { success: false, msg: "Cible invalide." };

  // 1. Calcul du coût (Simulation)
  const finalCost = applyCraftTableEffect(player, found, io, roomId, false);

  // 2. Vérification énergie
  if (player.energie < finalCost) {
    return { success: false, msg: "Pas assez d'énergie." };
  }

  // 3. Paiement et Consommation de l'effet
  applyCraftTableEffect(player, found, io, roomId, true);
  player.energie -= finalCost;

  // 4. Application de l'équipement
  const equipmentCard = JSON.parse(JSON.stringify(found));
  if (!targetMob.equipment) targetMob.equipment = [];
  targetMob.equipment.push(equipmentCard);

  // 5. Retrait de la main
  player.hand.splice(cardIndex, 1);

  io.to(roomId).emit("log", `${player.id} équipe ${found.name} sur ${targetMob.name}`);
  return { success: true, msg: `Équipement placé`, update: true };
}

// --- Terminer le tour ---
export function endTurn(io: Server, rooms: Map<string, any>, state: any) {
  state.turnIndex = (state.turnIndex + 1) % 2;
  const current = state.players[state.turnIndex];

  // Réinitialiser le statut d'attaque des mobs du joueur qui commence son tour
  current.board.forEach((card: InGameCard) => {
    card.hasAttacked = false;
    card.hasUsedTalent = false;

    // Retirer l'effet Esquive au début du tour du propriétaire (fin de l'effet temporaire)
    if (card.category === "mob" && card.effects) {
      const index = card.effects.indexOf("Esquive");
      if (index !== -1) {
        card.effects.splice(index, 1);
      }
    }
  });

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
          effects: player.effects,
          equipment: player.equipment,
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
              effects: opponent.effects,
              equipment: opponent.equipment,
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

      // J1 commence, il gagne 1 énergie dès le début
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
