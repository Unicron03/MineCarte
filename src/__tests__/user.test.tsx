import { describe, it, expect, beforeAll } from 'vitest'
import { getUser, updateUserPseudo } from '@/prisma/requests'
import { prisma } from '@/lib/prisma'

let user: any

beforeAll(async () => {
    user = await prisma.user.findUnique({
        where: { email: 'enzo@gmail.com' },
    })
    
    if (!user) {
        throw new Error('Utilisateur de test introuvable : enzo@gmail.com')
    }
})

describe('getUser', () => {
    it('création de l’utilisateur, puis obtention des informations', async () => {
        const fetchedUser = await getUser(user.id)
        expect(fetchedUser).toHaveProperty('name', 'evdp')
    })
})

describe('updateUserPseudo', () => {
    it('mise à jour du pseudo de l’utilisateur', async () => {
        const originalPseudo = user.name
        const newPseudo = 'evdp_updated'
        const updatedUser = await updateUserPseudo(user.id, newPseudo)

        expect(updatedUser).toHaveProperty('name', newPseudo)
        
        // rollback
        await updateUserPseudo(user.id, originalPseudo)
    })
})