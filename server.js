const { createServer } = require("http");
const { Server } = require("socket.io");

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: { origin: "*" },
});

let waitingPlayer = null;
const rooms = new Map();

// --- Types simplifiés ---
function createCard(name, cost, attack) {
  return { name, cost, attack };
}

// Decks propres aux joueurs
const deck1 = [createCard("Zombie", 2, 1), createCard("Golem", 5, 4)];
const deck2 = [createCard("Squelette", 2, 3), createCard("Golem", 5, 4)];

// --- Player factory ---
function createPlayer(id, deck) {
  return {
    id,
    cost: 0,
    hand: [...deck], // la main = deck au début
    board: [],
    turnCount: 0, // nombre de tours joués
  };
}

// --- Mettre à jour l'energie des joeurs ---
function updateCoutPlayer(player, isFirstPlayer) {
  player.turnCount += 1;
  if (isFirstPlayer) {
    player.cost += player.turnCount === 1 ? 1 : 2; 
  } else {
    player.cost += player.turnCount === 1 ? 2 : 2; 
  }
  return player.cost;
}

// --- Fonction piocher une carte ---
function takeCard(player) {
  // TODO: logique de pioche
  return `${player.id} pioche une carte (TODO)`;
}

// --- Fonction jouer une carte depuis votre main ---
function useCard(player, opponent, card) {
  if (card.cost <= player.cost) { // vérifie si je peux posser une carte 
    player.cost -= card.cost;
    player.hand = player.hand.filter((c) => c.name !== card.name);
    player.board.push(card);
    return {
      // A Implémenter (attention si c'est un mob, c'est pas pareil qu'un item par exemple on peut avoir uniquement 3 mobs sur le terrain )
      success: true,
      msgSelf: ` Vous avez posé ${card.name}`,
      msgOpponent: ` Votre adversaire a posé ${card.name}`,
    };
  } else {
    // A Implémenter 
    return { success: false, msgSelf: ` Pas assez de coût pour ${card.name}` };
  }
}

// --- Fonction attaquer ---
function attaque(player, opponent, card) {
  return {
    // A Implémenter
    msgSelf: ` Vous attaquez avec ${card.name} (attaque: ${card.attack})`,
    msgOpponent: ` Votre adversaire attaque avec ${card.name} (attaque: ${card.attack})`,
  };
}

// --- Fonction finir le tour ---
function endTurn(state) {
  state.turnIndex = (state.turnIndex + 1) % state.players.length;
}

// --- Fonction principal des actions du joueur poser une carte, attaquer, ... ---
function mainPlayerAction(state) {
  const current = state.players[state.turnIndex];
  const isFirstPlayer = state.turnIndex === 0;

  updateCoutPlayer(current, isFirstPlayer);
  const msg = takeCard(current);
  io.to(current.id).emit("log", msg);
}

// --- Gestion état ---
function sendGameState(roomId) {
  const state = rooms.get(roomId);
  if (!state) return;
  io.to(roomId).emit("updateState", state);
}

// --- Socket.io ---
io.on("connection", (socket) => {
  console.log("Joueur connecté:", socket.id);

  if (waitingPlayer) {
    const roomId = `room-${socket.id}-${waitingPlayer.id}`;
    socket.join(roomId);
    waitingPlayer.join(roomId);

    const state = {
      roomId,
      players: [
        createPlayer(waitingPlayer.id, deck1),
        createPlayer(socket.id, deck2),
      ],
      turnIndex: 0, // Le joeur 1 commence
    };

    rooms.set(roomId, state);

    io.to(roomId).emit("gameStart", { roomId });

    // notifier qui commence
    io.to(state.players[0].id).emit("yourTurn");
    io.to(state.players[1].id).emit("opponentTurn");

    // appliquer la logique du premier joueur
    mainPlayerAction(state);

    // envoyer l'état à tout le monde
    sendGameState(roomId);

    waitingPlayer = null;
  } else {
    waitingPlayer = socket;
    socket.emit("waiting");
  }

  // --- Jouer une carte ---
  socket.on("playCard", ({ roomId, card }) => { // le serveur écoute un message "playCard" envoyé par le client. Qui prend la salle des joueurs et la carte
    const state = rooms.get(roomId); // on cherche l'état de la partie
    if (!state) return; // si elle n'existe pas on arrête
    const current = state.players[state.turnIndex]; // le joueur dont c’est le tour
    const opponent = state.players.find((p) => p.id !== current.id); // l’autre joueur de la partie

    if (current.id !== socket.id) { // on vérifie que c'est bien la bonne personne qui joue
      socket.emit("notYourTurn");
      return;
    }

    const res = useCard(current, opponent, card); // on appelle la fonction useCard pour poser une carte
    if (res.success) { // si la carte a bien été poser
      io.to(current.id).emit("log", res.msgSelf); // on envoie au joueur le message comme quoi il a poser la carte
      io.to(opponent.id).emit("log", res.msgOpponent); // on envoie à l'autre joueur comme quoi sont adversaire à poser une carte
    } else {
      socket.emit("log", res.msgSelf); // on envoie au joueur que sa carte n'a pas été poser
    }

    sendGameState(roomId);
  });

  // --- Attaquer ---
  socket.on("attack", ({ roomId, card }) => {  // le serveur écoute un message "attack" envoyé par le client. Qui prend la salle des joueurs et la carte
    const state = rooms.get(roomId);  // on cherche l'état de la partie
    if (!state) return;
    const current = state.players[state.turnIndex];
    const opponent = state.players.find((p) => p.id !== current.id);

    const onBoard = current.board.find((c) => c.name === card.name); // on vérifie que la carte que le joueur veut utiliser pour attaquer est bien poser sur le terrain
    if (!onBoard) {
      socket.emit("log", ` ${card.name} n’est pas sur le board`); // on envoie un message au joueur (en théorie cette situation ne doit jamais arriver)
      return;
    }

    const res = attaque(current, opponent, card);
    io.to(current.id).emit("log", res.msgSelf); 
    io.to(opponent.id).emit("log", res.msgOpponent);
  });

  // --- Fin du tour ---
  socket.on("endTurn", ({ roomId }) => {
    const state = rooms.get(roomId);
    if (!state) return;

    endTurn(state);
    const current = state.players[state.turnIndex];
    const opponent = state.players.find((p) => p.id !== current.id);

    io.to(current.id).emit("yourTurn");
    io.to(opponent.id).emit("opponentTurn");

    mainPlayerAction(state);
    sendGameState(roomId);
  });

  // --- Quitter la partie ---
  socket.on("quit", ({ roomId }) => {
    const state = rooms.get(roomId);
    if (state) {
      io.to(roomId).emit("log", " Un joueur a quitté. Partie terminée.");
      rooms.delete(roomId);
    }
    socket.leave(roomId);
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }
  });

  socket.on("disconnect", () => {
     console.log("Déconnexion:", socket.id);
    // si un joueur quitte pendant l'attente
    if (waitingPlayer && waitingPlayer.id === socket.id) {
      waitingPlayer = null;
    }

    // si un joueur quitte en pleine partie
    for (const [roomId, state] of rooms) {
      if (state.players.some((p) => p.id === socket.id)) {
        io.to(roomId).emit("log", " Un joueur s'est déconnecté. Partie terminée.");
        rooms.delete(roomId);
        break;
      }
    }

  });
});

// --- Lancer le serveur ---
httpServer.listen(3001, () => {
  console.log(" Serveur WebSocket sur http://localhost:3001");
});
