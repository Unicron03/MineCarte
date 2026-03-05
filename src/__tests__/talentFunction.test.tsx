import { describe, it, expect, vi } from 'vitest'
import type { Server } from 'socket.io'
import {
    drawCard,
    soundDetection,
    removeEnergyFromOpponent,
    applyCarapaceEffect,
    pressionPsychologique,
    checkWitherExplosionNoire,
    enchantementPuissant,
    levitation,
    checkRetourALEnvoyeur,
    encreNoire,
    peurViscerale,
    updateGuardianEffect,
    applyGuardianProtection,
    checkLegendaryGrowth,
    applyLegendaryRequirement,
    checkFlammesPerpetuelles,
} from '@/server/functions/cartes/talentFunction'

import type { CombatState, Player, InGameCard } from '@/components/utils/typesPvp'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeCard(overrides: Partial<InGameCard> = {}): InGameCard {
    return {
        uuid: 'uuid-' + Math.random(),
        category: 'mob',
        name: 'TestMob',
        imageName: 'test.png',
        cost: 2,
        pv_durability: 10,
        max_pv: 10,
        hasAttacked: false,
        hasUsedTalent: false,
        talent: null,
        attack1: null,
        attack2: null,
        equipment: [],
        effects: [],
        ...overrides,
    } as InGameCard
}

function makePlayer(overrides: Partial<Player> = {}): Player {
    return {
        id: 'player-' + Math.random(),
        energie: 10,
        pv: 100,
        hand: [],
        board: [],
        deck: [],
        discard: [],
        turnCount: 1,
        token: 'token',
        effects: [],
        pendingAction: null,
        _disconnectedAt: null,
        ...overrides,
    }
}

function makeState(): CombatState {
    return { log: [] }
}

const mockIo = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
} as unknown as Server

const roomId = 'test-room'

// ─── drawCard ────────────────────────────────────────────────────────────────

describe('drawCard', () => {
    it('pioche le bon nombre de cartes du deck vers la main', () => {
        const state = makeState()
        const card1 = makeCard({ name: 'Carte1' })
        const card2 = makeCard({ name: 'Carte2' })
        const player = makePlayer({ deck: [card1, card2], hand: [] })

        drawCard(state, player, 2)

        expect(player.hand).toHaveLength(2)
        expect(player.deck).toHaveLength(0)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('pioche seulement ce qui reste si le deck est insuffisant', () => {
        const state = makeState()
        const card = makeCard()
        const player = makePlayer({ deck: [card], hand: [] })

        drawCard(state, player, 5)

        expect(player.hand).toHaveLength(1)
    })

    it('ne pioche pas si le deck est vide', () => {
        const state = makeState()
        const player = makePlayer({ deck: [], hand: [] })

        drawCard(state, player, 3)

        expect(player.hand).toHaveLength(0)
    })
})

// ─── soundDetection ───────────────────────────────────────────────────────────

describe('soundDetection', () => {
    it('inflige 10 dégâts à la carte activatrice', () => {
        const activator = makeCard({ name: 'Blaze', pv_durability: 15 })
        const wardenOwner = makePlayer()
        const opponent = makePlayer({ board: [activator] })

        soundDetection(mockIo, roomId, wardenOwner, opponent, activator)

        expect(activator.pv_durability).toBe(5)
    })

    it('ne plante pas si pv_durability est undefined', () => {
        const activator = makeCard({ pv_durability: undefined })
        const wardenOwner = makePlayer()
        const opponent = makePlayer({ board: [activator] })

        expect(() => soundDetection(mockIo, roomId, wardenOwner, opponent, activator)).not.toThrow()
    })
})

// ─── removeEnergyFromOpponent ─────────────────────────────────────────────────

describe('removeEnergyFromOpponent', () => {
    it("retire 1 énergie à l'adversaire", () => {
        const card = makeCard()
        const player = makePlayer()
        const opponent = makePlayer({ energie: 5 })

        removeEnergyFromOpponent(mockIo, roomId, player, opponent, card)

        expect(opponent.energie).toBe(4)
    })

    it("ne descend pas l'énergie en dessous de 0", () => {
        const card = makeCard()
        const player = makePlayer()
        const opponent = makePlayer({ energie: 0 })

        removeEnergyFromOpponent(mockIo, roomId, player, opponent, card)

        expect(opponent.energie).toBe(0)
    })
})

// ─── applyCarapaceEffect ──────────────────────────────────────────────────────

describe('applyCarapaceEffect', () => {
    it('applique CarapaceProtectrice à la carte', () => {
        const card = makeCard({ effects: [] })
        const player = makePlayer()
        const opponent = makePlayer()

        applyCarapaceEffect(mockIo, roomId, player, opponent, card)

        expect(card.effects).toContain('CarapaceProtectrice')
    })

    it("n'applique pas CarapaceProtectrice deux fois", () => {
        const card = makeCard({ effects: ['CarapaceProtectrice'] })
        const player = makePlayer()
        const opponent = makePlayer()

        applyCarapaceEffect(mockIo, roomId, player, opponent, card)

        const count = card.effects!.filter(e => e === 'CarapaceProtectrice').length
        expect(count).toBe(1)
    })
})

// ─── pressionPsychologique ────────────────────────────────────────────────────

describe('pressionPsychologique', () => {
    it("inflige 5 dégâts au joueur adverse", () => {
        const deadOwner = makePlayer()
        const killer = makePlayer({ pv: 100, board: [] })

        pressionPsychologique(mockIo, roomId, deadOwner, killer)

        expect(killer.pv).toBe(95)
    })

    it("inflige 15 dégâts à chaque mob adverse", () => {
        const mob1 = makeCard({ pv_durability: 20 })
        const mob2 = makeCard({ pv_durability: 15 })
        const deadOwner = makePlayer()
        const killer = makePlayer({ pv: 100, board: [mob1, mob2] })

        pressionPsychologique(mockIo, roomId, deadOwner, killer)

        expect(mob1.pv_durability).toBe(5)
        expect(mob2.pv_durability).toBe(0)
    })
})

// ─── checkWitherExplosionNoire ────────────────────────────────────────────────

describe('checkWitherExplosionNoire', () => {
    it('applique WitherEnrage si PV <= 30% du max', () => {
        const card = makeCard({ pv_durability: 3, max_pv: 10, effects: [] })
        const player = makePlayer({ board: [card] })
        const opponent = makePlayer()

        checkWitherExplosionNoire(mockIo, roomId, player, opponent, card)

        expect(card.effects).toContain('WitherEnrage')
    })

    it('ne fait rien si PV > 30% du max', () => {
        const card = makeCard({ pv_durability: 7, max_pv: 10, effects: [] })
        const player = makePlayer({ board: [card] })
        const opponent = makePlayer()

        checkWitherExplosionNoire(mockIo, roomId, player, opponent, card)

        expect(card.effects).not.toContain('WitherEnrage')
    })

    it('retire WitherEnrage si la carte est soignée au-dessus de 30%', () => {
        const card = makeCard({ pv_durability: 7, max_pv: 10, effects: ['WitherEnrage'] })
        const player = makePlayer({ board: [card] })
        const opponent = makePlayer()

        checkWitherExplosionNoire(mockIo, roomId, player, opponent, card)

        expect(card.effects).not.toContain('WitherEnrage')
    })
})

// ─── enchantementPuissant ─────────────────────────────────────────────────────

describe('enchantementPuissant', () => {
    it('soigne la carte de 5 PV', () => {
        const card = makeCard({ pv_durability: 10 })
        const player = makePlayer()
        const opponent = makePlayer()

        enchantementPuissant(mockIo, roomId, player, opponent, card)

        expect(card.pv_durability).toBe(15)
    })

    it('ne plante pas si pv_durability est undefined', () => {
        const card = makeCard({ pv_durability: undefined })
        const player = makePlayer()
        const opponent = makePlayer()

        expect(() => enchantementPuissant(mockIo, roomId, player, opponent, card)).not.toThrow()
    })
})

// ─── levitation ───────────────────────────────────────────────────────────────

describe('levitation', () => {
    it("déplace une carte de la main adverse vers le deck", () => {
        const cardInHand = makeCard({ name: 'CarteMélangée' })
        const card = makeCard()
        const player = makePlayer()
        const opponent = makePlayer({ hand: [cardInHand], deck: [] })

        levitation(mockIo, roomId, player, opponent, card)

        expect(opponent.hand).not.toContain(cardInHand)
        expect(opponent.deck).toContain(cardInHand)
    })

    it("ne fait rien si la main adverse est vide", () => {
        const card = makeCard()
        const player = makePlayer()
        const opponent = makePlayer({ hand: [], deck: [] })

        expect(() => levitation(mockIo, roomId, player, opponent, card)).not.toThrow()
        expect(opponent.deck).toHaveLength(0)
    })
})

// ─── checkRetourALEnvoyeur ────────────────────────────────────────────────────

describe('checkRetourALEnvoyeur', () => {
    it('retourne true ou false (probabiliste 25%)', () => {
        const attacker = makeCard()
        const player = makePlayer()
        const opponent = makePlayer()

        let gotTrue = false
        let gotFalse = false

        for (let i = 0; i < 100; i++) {
            const result = checkRetourALEnvoyeur(mockIo, roomId, attacker, player, opponent)
            if (result === true) gotTrue = true
            if (result === false) gotFalse = true
            if (gotTrue && gotFalse) break
        }

        expect(gotTrue).toBe(true)
        expect(gotFalse).toBe(true)
    })
})

// ─── encreNoire ───────────────────────────────────────────────────────────────

describe('encreNoire', () => {
    it("applique l'effet EncreNoire au joueur", () => {
        const card = makeCard()
        const player = makePlayer({ effects: [] })
        const opponent = makePlayer()

        encreNoire(mockIo, roomId, player, opponent, card)

        expect(player.effects).toContain('EncreNoire')
    })

    it("n'applique pas EncreNoire deux fois", () => {
        const card = makeCard()
        const player = makePlayer({ effects: ['EncreNoire'] })
        const opponent = makePlayer()

        encreNoire(mockIo, roomId, player, opponent, card)

        const count = player.effects!.filter(e => e === 'EncreNoire').length
        expect(count).toBe(1)
    })
})

// ─── peurViscerale ────────────────────────────────────────────────────────────

describe('peurViscerale', () => {
    it("retire un Creeper du plateau adverse et le met en défausse", () => {
        const card = makeCard()
        const creeper = makeCard({ name: 'Creeper', equipment: [] })
        const player = makePlayer()
        const opponent = makePlayer({ board: [creeper], discard: [] })

        const result = peurViscerale(mockIo, roomId, player, opponent, card)

        expect(result).toBe(true)
        expect(opponent.board).not.toContain(creeper)
        expect(opponent.discard).toContain(creeper)
    })

    it("retourne false si aucun Creeper sur le plateau adverse", () => {
        const card = makeCard()
        const zombie = makeCard({ name: 'Zombie' })
        const player = makePlayer()
        const opponent = makePlayer({ board: [zombie] })

        const result = peurViscerale(mockIo, roomId, player, opponent, card)

        expect(result).toBe(false)
    })
})

// ─── updateGuardianEffect ─────────────────────────────────────────────────────

describe('updateGuardianEffect', () => {
    it('ajoute LienEternel si 2 Gardiens ou plus sont présents', () => {
        const state = makeState()
        const g1 = makeCard({ name: 'Gardien', pv_durability: 5 })
        const g2 = makeCard({ name: 'Gardien', pv_durability: 5 })
        const player = makePlayer({ board: [g1, g2], effects: [] })

        updateGuardianEffect(state, player)

        expect(player.effects).toContain('LienEternel')
    })

    it('retire LienEternel si moins de 2 Gardiens', () => {
        const state = makeState()
        const g1 = makeCard({ name: 'Gardien', pv_durability: 5 })
        const player = makePlayer({ board: [g1], effects: ['LienEternel'] })

        updateGuardianEffect(state, player)

        expect(player.effects).not.toContain('LienEternel')
    })

    it("ne fait rien si aucun Gardien et LienEternel absent", () => {
        const state = makeState()
        const player = makePlayer({ board: [], effects: [] })

        expect(() => updateGuardianEffect(state, player)).not.toThrow()
        expect(player.effects).not.toContain('LienEternel')
    })
})

// ─── applyGuardianProtection ──────────────────────────────────────────────────

describe('applyGuardianProtection', () => {
    it('bloque les dégâts qui feraient descendre sous 10 PV si LienEternel actif', () => {
        const state = makeState()
        const player = makePlayer({ pv: 15, effects: ['LienEternel'] })

        const finalDamage = applyGuardianProtection(state, player, 10)

        expect(finalDamage).toBe(5)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('bloque tous les dégâts si le joueur est déjà à 10 PV ou moins', () => {
        const state = makeState()
        const player = makePlayer({ pv: 8, effects: ['LienEternel'] })

        const finalDamage = applyGuardianProtection(state, player, 5)

        expect(finalDamage).toBe(0)
    })

    it('ne modifie pas les dégâts si LienEternel est absent', () => {
        const state = makeState()
        const player = makePlayer({ pv: 15, effects: [] })

        const finalDamage = applyGuardianProtection(state, player, 10)

        expect(finalDamage).toBe(10)
    })
})

// ─── checkLegendaryGrowth ─────────────────────────────────────────────────────

describe('checkLegendaryGrowth', () => {
    it("retourne true si un Œuf de dragon est sur le plateau", () => {
        const dragon = makeCard({ name: 'Ender Dragon', talent: 'Croissance légendaire' })
        const egg = makeCard({ name: 'Œuf de dragon' })
        const player = makePlayer({ board: [egg] })

        expect(checkLegendaryGrowth(player, dragon)).toBe(true)
    })

    it("retourne false si aucun œuf n'est présent", () => {
        const dragon = makeCard({ name: 'Ender Dragon', talent: 'Croissance légendaire' })
        const player = makePlayer({ board: [] })

        expect(checkLegendaryGrowth(player, dragon)).toBe(false)
    })

    it("retourne true pour une carte sans le talent requis", () => {
        const mob = makeCard({ name: 'Zombie', talent: null })
        const player = makePlayer({ board: [] })

        expect(checkLegendaryGrowth(player, mob)).toBe(true)
    })
})

// ─── applyLegendaryRequirement ────────────────────────────────────────────────

describe('applyLegendaryRequirement', () => {
    it("sacrifie l'Œuf de dragon du plateau", () => {
        const egg = makeCard({ name: 'Œuf de dragon', equipment: [] })
        const player = makePlayer({ board: [egg], discard: [] })

        applyLegendaryRequirement(mockIo, roomId, player)

        expect(player.board).not.toContain(egg)
        expect(player.discard).toContain(egg)
    })

    it("ne fait rien si aucun œuf n'est sur le plateau", () => {
        const player = makePlayer({ board: [], discard: [] })

        expect(() => applyLegendaryRequirement(mockIo, roomId, player)).not.toThrow()
    })
})

// ─── checkFlammesPerpetuelles ─────────────────────────────────────────────────

describe('checkFlammesPerpetuelles', () => {
    it("peut infliger 5 dégâts supplémentaires au joueur adverse (probabiliste 50%)", () => {
        const blaze = makeCard({ name: 'Blaze', talent: 'Flammes perpétuelles' })

        let damaged = false
        for (let i = 0; i < 50; i++) {
            const o = makePlayer({ pv: 100 })
            checkFlammesPerpetuelles(mockIo, roomId, blaze, o)
            if (o.pv < 100) {
                damaged = true
                break
            }
        }

        expect(damaged).toBe(true)
    })

    it("ne fait rien si la carte n'est pas un Blaze", () => {
        const zombie = makeCard({ name: 'Zombie', talent: null })
        const opponent = makePlayer({ pv: 100 })

        for (let i = 0; i < 20; i++) {
            checkFlammesPerpetuelles(mockIo, roomId, zombie, opponent)
        }

        expect(opponent.pv).toBe(100)
    })
})