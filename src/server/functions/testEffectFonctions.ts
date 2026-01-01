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

// Vérifie si une cible esquive l'attaque (45% de chance)
export function hasEsquive(target: InGameCard, state: CombatState): boolean {
  if (target.effects?.includes("Esquive")) {
    if (Math.random() < 0.45) {
      state.log.push(`${target.name} esquive l'attaque grâce à sa furtivité !`);
      return true;
    }
  }
  return false;
}

// Vérifie si une cible est invisible (ne peut pas être ciblée par une attaque)
export function hasInvisibility(target: InGameCard): boolean {
  return target.effects?.includes("Invisible") ?? false;
}

// Vérifie la synergie Golem <-> Villageois
// À appeler quand une carte est jouée ou quand une carte meurt
export function checkVillageGuardian(player: Player, io: Server, roomId: string): void {
  // 1. Vérifier la présence d'un Villageois
  const hasVillager = player.board.some((c) => c.name === "Villageois");
  
  // 2. Récupérer tous les Golems
  const golems = player.board.filter((c) => c.name === "Golem");

  golems.forEach((golem) => {
    if (!golem.effects) golem.effects = [];
    const hasBuff = golem.effects.includes("DoubleDamage");

    if (hasVillager && !hasBuff) {
      // Activation de l'effet
      golem.effects.push("DoubleDamage");
      io.to(roomId).emit("log", `${golem.name} s'enrage grâce à la présence d'un Villageois ! (Dégâts x2)`);
    } else if (!hasVillager && hasBuff) {
      // Désactivation de l'effet
      golem.effects = golem.effects.filter((e) => e !== "DoubleDamage");
      io.to(roomId).emit("log", `${golem.name} se calme (Plus de Villageois à protéger).`);
    }
  });
}

// Calcule les dégâts sortants en fonction des effets de l'attaquant (ex: DoubleDamage)
export function getModifiedDamage(attacker: InGameCard, baseDamage: number): number {
  let finalDamage = baseDamage;

  // Application du DoubleDamage (Gardien du Village)
  if (attacker.effects?.includes("DoubleDamage")) {
    finalDamage *= 2;
  }

  // Application Pomme Dorée (+10 dégâts)
  const goldenApple = attacker.effects?.find(e => e.startsWith("GoldenApple_"));
  if (goldenApple) {
      finalDamage += 10;
  }

  return finalDamage;
}

// Gère l'effet de brûlure (dégâts sur la durée)
export function handleBurnEffect(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player,
  cardIndex: number
): void {
  const card = player.board[cardIndex];
  // Vérification que la carte existe et a des effets
  if (!card || !card.effects) return;

  // On cherche l'effet de brûlure
  // Typage explicite de 'e' pour éviter l'erreur "implicitly has an 'any' type"
  const burnEffect = card.effects.find((e: string) => e.startsWith("Burn_"));
  
  if (burnEffect) {
    const duration = parseInt(burnEffect.split("_")[1]);

    // Application des dégâts (10 PV)
    if (card.pv_durability !== undefined) {
      card.pv_durability -= 10;
      state.log.push(`${card.name} brûle et perd 10 PV !`);
    }

    // Mise à jour de la durée de l'effet
    const index = card.effects.indexOf(burnEffect);
    if (index !== -1) {
      card.effects.splice(index, 1);
    }

    if (duration > 1) {
      card.effects.push(`Burn_${duration - 1}`);
    } else {
      state.log.push(`La brûlure de ${card.name} se dissipe.`);
    }

    // Vérification de la mort due à la brûlure
    if (card.pv_durability !== undefined && card.pv_durability <= 0) {
      state.log.push(`${card.name} est consumé par le feu !`);
      player.discard.push(card);
      player.board.splice(cardIndex, 1);
      
      // Vérification des synergies (ex: Villageois mort -> Golem perd buff)
      checkVillageGuardian(player, io, roomId);
    }
  }
}

// Gère l'effet de la Pomme dorée (Soin périodique + décrémentation durée)
// Le bonus de dégâts est géré dans getModifiedDamage
export function handleGoldenAppleEffect(
  io: Server,
  roomId: string,
  state: CombatState,
  player: Player,
  cardIndex: number
): void {
  const card = player.board[cardIndex];
  if (!card || !card.effects) return;

  const effect = card.effects.find(e => e.startsWith("GoldenApple_"));
  if (effect) {
    const duration = parseInt(effect.split("_")[1]);

    // Soin de 10 PV
    if (card.pv_durability !== undefined) {
        const maxPv = card.max_pv || 100; // Fallback si max_pv non défini
        const healAmount = Math.min(10, maxPv - card.pv_durability);
        if (healAmount > 0) {
            card.pv_durability += healAmount;
            state.log.push(`${card.name} récupère ${healAmount} PV grâce à la Pomme dorée.`);
        }
    }

    // Mise à jour de la durée
    const index = card.effects.indexOf(effect);
    if (index !== -1) card.effects.splice(index, 1);

    if (duration > 1) {
        card.effects.push(`GoldenApple_${duration - 1}`);
    } else {
        state.log.push(`L'effet de la Pomme dorée sur ${card.name} se dissipe.`);
    }
  }
}