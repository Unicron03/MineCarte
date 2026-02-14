import { describe, it, expect } from 'vitest'
import { getAttackById } from '@/prisma/requests'

describe('getAttackById', () => {
    it('récupération d’une attaque par son ID', async () => {
        const action = await getAttackById(1)

        expect(action).toBeInstanceOf(Array)
        expect(action.length).toBeGreaterThan(0)
        expect(action[0]).toHaveProperty('name', "Flèche rapide")
        expect(action[0]).toHaveProperty('description', "Inflige 10 PV à un mob adverse.")
        expect(action[0]).toHaveProperty('damage', 10)
        expect(action[0]).toHaveProperty('cost', 1)
        expect(action[0]).toHaveProperty('function_name', "AttackOneMob")
        expect(action[0]).toHaveProperty('requiresTarget', true)
        expect(action[0]).toHaveProperty('targetType', 'enemy')
    })
})