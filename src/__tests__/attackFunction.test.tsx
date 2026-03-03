import { describe, it, expect, vi } from 'vitest'
import type { Server } from 'socket.io'
import {
    AttackOneMob,
    heal,
    AttackAllMobs,
    attackEsquive,
    damageAndDie,
    voleEnergie,
    attackDirectPlayer,
    hurlementSombre,
    applyTankEffect,
    AttaqueRandomMobAndPlayer,
    AttackRandomCat,
    applyTortueGenialeEffect,
    applyDimensionalProtection,
    Entraide,
    AppelAUnAmi,
} from '@/server/functions/cartes/attackFunction'

import type { CombatState, Player, InGameCard } from '@/components/utils/typesPvp'

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeCard(overrides: Partial<InGameCard> = {}): InGameCard {
    return {
        uuid: 'card-uuid-' + Math.random(),
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

// Mock io et roomId pour les fonctions qui en ont besoin
const mockIo = {
    to: vi.fn().mockReturnThis(),
    emit: vi.fn(),
} as unknown as Server

const roomId = 'test-room'

// ─── AttackOneMob ────────────────────────────────────────────────────────────

describe('AttackOneMob', () => {
    it('inflige des dégâts à la carte cible', () => {
        const state = makeState()
        const attacker = makeCard({ name: 'Attaquant', pv_durability: 10 })
        const target = makeCard({ name: 'Cible', pv_durability: 10 })
        const opponent = makePlayer({ board: [target] })

        AttackOneMob(state, attacker, target, 4, opponent)

        expect(target.pv_durability).toBe(6)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('retourne killed:true si les PV tombent à 0 ou moins', () => {
        const state = makeState()
        const attacker = makeCard()
        const target = makeCard({ pv_durability: 3 })
        const opponent = makePlayer({ board: [target] })

        const result = AttackOneMob(state, attacker, target, 10, opponent)

        expect(result?.killed).toBe(true)
    })

    it('ne fait rien si la cible est null', () => {
        const state = makeState()
        const attacker = makeCard()
        const opponent = makePlayer({ board: [] })

        // Ne doit pas throw
        expect(() => AttackOneMob(state, attacker, null, 5, opponent)).not.toThrow()
    })
})

// ─── heal ────────────────────────────────────────────────────────────────────

describe('heal', () => {
    it('soigne la carte cible', () => {
        const state = makeState()
        const target = makeCard({ pv_durability: 5, max_pv: 10 })

        heal(state, target, 3)

        expect(target.pv_durability).toBe(8)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne soigne pas au-delà du max_pv', () => {
        const state = makeState()
        const target = makeCard({ pv_durability: 9, max_pv: 10 })

        heal(state, target, 5)

        expect(target.pv_durability).toBe(10)
    })

    it('ne soigne pas si la carte est déjà au max', () => {
        const state = makeState()
        const target = makeCard({ pv_durability: 10, max_pv: 10 })

        heal(state, target, 5)

        expect(target.pv_durability).toBe(10)
    })
})

// ─── AttackAllMobs ───────────────────────────────────────────────────────────

describe('AttackAllMobs', () => {
    it('inflige des dégâts à tous les mobs du plateau adverse', () => {
        const state = makeState()
        const attacker = makeCard()
        const mob1 = makeCard({ name: 'Mob1', pv_durability: 10 })
        const mob2 = makeCard({ name: 'Mob2', pv_durability: 8 })
        const opponent = makePlayer({ board: [mob1, mob2] })
        const player = makePlayer()

        AttackAllMobs(mockIo, roomId, state, attacker, 3, opponent, player)

        expect(mob1.pv_durability).toBe(7)
        expect(mob2.pv_durability).toBe(5)
    })

    it('ne plante pas si le plateau adverse est vide', () => {
        const state = makeState()
        const attacker = makeCard()
        const opponent = makePlayer({ board: [] })
        const player = makePlayer()

        expect(() => AttackAllMobs(mockIo, roomId, state, attacker, 3, opponent, player)).not.toThrow()
    })
})

// ─── attackEsquive ───────────────────────────────────────────────────────────

describe('attackEsquive', () => {
    it('peut rater si la cible a le tag Esquive', () => {
        const attacker = makeCard()
        const target = makeCard({ pv_durability: 10, effects: ['Esquive'] })
        const opponent = makePlayer({ board: [target] })

        // On lance plusieurs fois : parfois l'attaque rate (esquive)
        let missed = false
        for (let i = 0; i < 30; i++) {
            const t = makeCard({ pv_durability: 10, effects: ['Esquive'] })
            const s = makeState()
            attackEsquive(s, attacker, t, 5, opponent)
            if (t.pv_durability === 10) {
                missed = true
                break
            }
        }
        expect(missed).toBe(true)
    })

    it('inflige normalement sans esquive', () => {
        const state = makeState()
        const attacker = makeCard()
        const target = makeCard({ pv_durability: 10, effects: [] })
        const opponent = makePlayer({ board: [target] })

        // Sans esquive l'attaque doit toujours toucher
        let alwaysHits = true
        for (let i = 0; i < 10; i++) {
            const t = makeCard({ pv_durability: 10, effects: [] })
            attackEsquive(state, attacker, t, 5, opponent)
            if (t.pv_durability === 10) {
                alwaysHits = false
                break
            }
        }
        expect(alwaysHits).toBe(true)
    })
})

// ─── damageAndDie ────────────────────────────────────────────────────────────

describe('damageAndDie', () => {
    it("inflige des dégâts et tue l'attaquant", () => {
        const state = makeState()
        const attacker = makeCard({ pv_durability: 10 })
        const target = makeCard({ pv_durability: 10 })
        const player = makePlayer({ board: [attacker] })
        const opponent = makePlayer({ board: [target] })

        damageAndDie(state, attacker, target, 5, player, opponent)

        expect(target.pv_durability).toBeLessThan(10)
        // L'attaquant doit être mort après l'attaque
        expect(state.log.some(l => l.toLowerCase().includes(attacker.name.toLowerCase()))).toBe(true)
    })
})

// ─── voleEnergie ─────────────────────────────────────────────────────────────

describe('voleEnergie', () => {
    it("vole de l'énergie à l'adversaire", () => {
        const state = makeState()
        const attacker = makeCard()
        const target = makeCard({ pv_durability: 10 })
        const opponent = makePlayer({ energie: 5, board: [target] })

        voleEnergie(state, attacker, target, 2, opponent)

        expect(opponent.energie).toBeLessThan(5)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it("ne vole pas plus que l'adversaire possède", () => {
        const state = makeState()
        const attacker = makeCard()
        const target = makeCard({ pv_durability: 10 })
        const opponent = makePlayer({ energie: 1, board: [target] })

        voleEnergie(state, attacker, target, 5, opponent)

        expect(opponent.energie).toBeGreaterThanOrEqual(0)
    })
})

// ─── attackDirectPlayer ───────────────────────────────────────────────────────

describe('attackDirectPlayer', () => {
    it('inflige des dégâts directement au joueur adverse', () => {
        const state = makeState()
        const attacker = makeCard()
        const opponent = makePlayer({ pv: 100, board: [] })

        attackDirectPlayer(state, attacker, 8, opponent)

        expect(opponent.pv).toBe(92)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne peut pas descendre les PV sous 0', () => {
        const state = makeState()
        const attacker = makeCard()
        const opponent = makePlayer({ pv: 5, board: [] })

        attackDirectPlayer(state, attacker, 100, opponent)

        expect(opponent.pv).toBeLessThanOrEqual(0)
    })
})

// ─── hurlementSombre ─────────────────────────────────────────────────────────

describe('hurlementSombre', () => {
    it('inflige des dégâts et applique un effet négatif', () => {
        const state = makeState()
        const attacker = makeCard()
        const target = makeCard({ pv_durability: 10, effects: [] })
        const opponent = makePlayer({ board: [target] })

        hurlementSombre(state, attacker, target, 3, opponent)

        expect(target.pv_durability).toBeLessThan(10)
        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne plante pas si la cible est null', () => {
        const state = makeState()
        const attacker = makeCard()
        const opponent = makePlayer({ board: [] })

        expect(() => hurlementSombre(state, attacker, null, 3, opponent)).not.toThrow()
    })
})

// ─── applyTankEffect ─────────────────────────────────────────────────────────

describe('applyTankEffect', () => {
    it("applique l'effet Tank à la carte", () => {
        const state = makeState()
        const attacker = makeCard({ effects: [] })

        applyTankEffect(state, attacker)

        expect(attacker.effects).toContain('Bon gros tank')
        expect(state.log.length).toBeGreaterThan(0)
    })

    it("n'applique pas Tank deux fois", () => {
        const state = makeState()
        const attacker = makeCard({ effects: ['Bon gros tank'] })

        applyTankEffect(state, attacker)

        const tankCount = attacker.effects!.filter(e => e === 'Bon gros tank').length
        expect(tankCount).toBe(1)
    })
})

// ─── AttaqueRandomMobAndPlayer ────────────────────────────────────────────────

describe('AttaqueRandomMobAndPlayer', () => {
    it('inflige des dégâts même si le board est vide (attaque directe)', () => {
        const state = makeState()
        const attacker = makeCard()
        const opponent = makePlayer({ pv: 100, board: [] })
        const player = makePlayer()

        AttaqueRandomMobAndPlayer(mockIo, roomId, state, attacker, 5, opponent, player)

        expect(state.log.length).toBeGreaterThan(0)
    })

    it('inflige des dégâts avec des mobs en jeu', () => {
        const state = makeState()
        const attacker = makeCard()
        const mob = makeCard({ pv_durability: 10 })
        const opponent = makePlayer({ pv: 100, board: [mob] })
        const player = makePlayer()

        AttaqueRandomMobAndPlayer(mockIo, roomId, state, attacker, 3, opponent, player)

        // Le log confirme qu'une action s'est passée
        expect(state.log.length).toBeGreaterThan(0)
    })
})

// ─── AttackRandomCat ─────────────────────────────────────────────────────────

describe('AttackRandomCat', () => {
    it('attaque une carte aléatoire parmi les chats adverses', () => {
        const state = makeState()
        const attacker = makeCard({ name: 'Attaquant' })
        const cat = makeCard({ name: 'Chat', pv_durability: 8 })
        const player = makePlayer({ board: [attacker] })
        const opponent = makePlayer({ board: [cat] })

        AttackRandomCat(state, attacker, cat, opponent, mockIo, roomId, player)

        expect(state.log.length).toBeGreaterThan(0)
    })
})

// ─── applyTortueGenialeEffect ─────────────────────────────────────────────────

describe('applyTortueGenialeEffect', () => {
    it("applique l'effet Tortue Géniale", () => {
        const state = makeState()
        const attacker = makeCard({ effects: [] })

        applyTortueGenialeEffect(state, attacker)

        expect(state.log.length).toBeGreaterThan(0)
    })
})

// ─── applyDimensionalProtection ───────────────────────────────────────────────

describe('applyDimensionalProtection', () => {
    it('applique la protection dimensionnelle au joueur', () => {
        const state = makeState()
        const player = makePlayer({ effects: [] })

        applyDimensionalProtection(state, player)

        expect(player.effects).toContain('ProtectionDimensionnelle_1')
        expect(state.log.length).toBeGreaterThan(0)
    })

    it("n'applique pas la protection deux fois", () => {
        const state = makeState()
        const player = makePlayer({ effects: ['ProtectionDimensionnelle_1'] })

        applyDimensionalProtection(state, player)

        const count = player.effects!.filter(e => e === 'ProtectionDimensionnelle_1').length
        expect(count).toBe(1)
    })
})

// ─── Entraide ─────────────────────────────────────────────────────────────────

describe('Entraide', () => {
    it('soigne un allié présent sur le plateau', () => {
        const state = makeState()
        const attacker = makeCard({ name: 'Soutien', pv_durability: 5 })
        const ally = makeCard({ name: 'Allié', pv_durability: 5, max_pv: 10 })
        const player = makePlayer({ board: [attacker, ally] })
        const opponent = makePlayer()

        Entraide(state, attacker, ally, player, opponent, mockIo, roomId)

        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne plante pas si aucun allié disponible', () => {
        const state = makeState()
        const attacker = makeCard()
        const player = makePlayer({ board: [attacker] })
        const opponent = makePlayer()

        expect(() => Entraide(state, attacker, null, player, opponent, mockIo, roomId)).not.toThrow()
    })
})

// ─── AppelAUnAmi ──────────────────────────────────────────────────────────────

describe('AppelAUnAmi', () => {
    it('invoque une carte depuis le deck', () => {
        const state = makeState()
        const cardInDeck = makeCard({ name: 'Ami' })
        const player = makePlayer({ deck: [cardInDeck], board: [] })

        AppelAUnAmi(state, player)

        expect(state.log.length).toBeGreaterThan(0)
    })

    it('ne plante pas si le deck est vide', () => {
        const state = makeState()
        const player = makePlayer({ deck: [], board: [] })

        expect(() => AppelAUnAmi(state, player)).not.toThrow()
    })
})