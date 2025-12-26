import { Server } from "socket.io";
import { InGameCard, CombatState, Player } from "../../typesPvp";
import { actionList } from "../../data";

// Calcule les dégâts finaux après application des effets de réduction des équipements.
export function applyArmorEffect(
  target: InGameCard,
  initialDamage: number,
  state: CombatState
): number {
  let finalDamage = initialDamage;

  if (target.category === "mob" && target.equipment && target.equipment.length > 0) {
    const hasArmor = target.equipment.some((eq) => eq.name === "Armure");
    if (hasArmor) {
      finalDamage = Math.max(0, finalDamage - 10);
      state.log.push(`L'armure de ${target.name} absorbe 10 dégâts !`);
    }
  }

  return finalDamage;
}

// Applique l'effet de la Table de craft (réduction de coût) si disponible.
export function applyCraftTableEffect(
  player: Player,
  card: InGameCard,
  io: Server,
  roomId: string,
  consume: boolean = true
): number {
  let finalCost = card.cost;
  const craftEffectName = "Table de craft";
  const craftEffectIndex = player.effects?.findIndex((e) => e === craftEffectName);

  if (craftEffectIndex !== undefined && craftEffectIndex !== -1) {
    const effectAction = actionList.find((a) => a.name === craftEffectName);
    const reduction = effectAction?.damage || 0; // 'damage' contient la valeur de la réduction
    finalCost = Math.max(0, finalCost - reduction);

    if (consume) {
      player.effects!.splice(craftEffectIndex, 1); // On retire l'effet après l'avoir utilisé
      io.to(roomId).emit("log", `[Jeu] Coût de ${card.name} réduit de ${reduction} grâce à la Table de craft.`);
    }
  }

  return finalCost;
}