import { Server, Socket } from "socket.io";
import { CombatState, Player, Action, InGameCard } from "../../typesPvp";
import { actionList } from "../../data";
import { sendGameState, checkVictory, drawCard as drawCardLogic } from "../functions/gameLogic";
import { dealDamage, heal, drawCard, applyEffect } from "../functions/attackFunctions";



// Récupère l'action dans actionList grace a son nom
// Du style { id: 1, name: "Morsure", damage: 10, cost: 1, description: "Une morsure violente." },
function getActionByName(name: string): Action | undefined {
  return actionList.find(
    (a) => a.name.toLowerCase() === name.toLowerCase()
  );
}


function executeAction( state: CombatState, action: Action, attacker: InGameCard, target: InGameCard | null, player: Player, opponent: Player) {

  // Vérification de l'énergie
  if (player.energie < action.cost) {
    state.log.push(`Pas assez d'énergie pour ${action.name}`);
    return;
  }

  // Je retire l'énergie au jouer
  player.energie -= action.cost;

  // J'execute l'action
  switch (action.function) {
    case "dealDamage":
      if (!action.damage) return;
      return dealDamage( state, attacker, target, action.damage, opponent);

    case "heal":
      if (!action.damage) return;
      heal(state, attacker, action.damage);
      return;

    case "drawCard":
      if (!action.damage) return;
      // Note: `drawCard` dans `attackFunctions` est différent de `gameLogic`
      // Ici, on veut piocher pour le joueur, donc on utilise celui de gameLogic
      for(let i = 0; i < action.damage; i++) {
        drawCardLogic(player);
      }
      state.log.push(`${player.id} pioche ${action.damage} carte(s).`);
      return;

    case "applyEffect":
      return applyEffect(state, player, action);
  }
}


export function attackSocket(io: Server, socket: Socket, rooms: Map<string, any>) {

  socket.on("attack", ({ roomId, attackerIndex, attackName, targetIndex }) => {
  const room = rooms.get(roomId);
  if (!room) return;

  const playerIndex = room.players.findIndex(
    (p: Player) => p.id === socket.id
  );
  if (playerIndex === -1) return;

  const opponentIndex = playerIndex === 0 ? 1 : 0;
  const player = room.players[playerIndex];
  const opponent = room.players[opponentIndex];

  const attacker = player.board[attackerIndex];
  if (!attacker) return;

  // Je récupécure l'action
  const action = getActionByName(attackName);
  if (!action) {
    socket.emit("log", `Action inconnue : ${attackName}`);
    return;
  }

  const target =
    targetIndex !== null && opponent.board[targetIndex]
      ? opponent.board[targetIndex]
      : null;

  const state: CombatState = { log: [] };

  const result = executeAction( state, action, attacker, target, player, opponent);

  // Gestion de la mort d'une carte
  if (result?.killed && target && targetIndex !== null) { // Si une carte est tuée
    opponent.discard.push(target);
    opponent.board.splice(targetIndex, 1);
    state.log.push(`${target.name} est détruite !`);
  }

  // Gestion de la défaite du joueur (qui peut arriver sur une attaque directe)
  if (result?.killed && !target) { // Si le joueur est tué
    state.log.push(`Le joueur est vaincu !`);
  }

  state.log.forEach((msg) => io.to(roomId).emit("log", msg));
  sendGameState(io, rooms, roomId);
  checkVictory(io, room, rooms);
});

}
