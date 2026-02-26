import { describe, it, expect, beforeAll } from 'vitest'
import { getUser, updateUserPseudo, deleteUser } from '@/prisma/requests'
import { prisma } from '@/lib/prisma'
import { Prisma } from '../../generated/prisma/client'
import { auth } from '@/lib/auth'

let user: Prisma.UserGetPayload<Record<string, never>>

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test@gmail.com' } })
    
    await auth.api.signUpEmail({
        body: {
            email: 'test@gmail.com',
            password: 'azertyuiop',
            name: 'testName',
        }
    });

    const tempUser = await prisma.user.findUnique({
        where: { email: 'test@gmail.com' },
    })
    if (tempUser) {
        user = tempUser
    } else {
        throw new Error('Utilisateur de test introuvable après création : test@gmail.com')
    }
})

describe('getUser', () => {
    it('obtention des informations de l’utilisateur', async () => {
        const fetchedUser = await getUser(user.id)
        expect(fetchedUser).toHaveProperty('name', 'testName')
    })
})

describe('updateUserPseudo', () => {
    it('mise à jour du pseudo de l’utilisateur', async () => {
        const originalPseudo = user.name
        const newPseudo = 'testName_updated'
        const updatedUser = await updateUserPseudo(user.id, newPseudo)

        expect(updatedUser).toHaveProperty('name', newPseudo)
        
        // rollback
        await updateUserPseudo(user.id, originalPseudo)
    })
})

describe('deleteUser', () => {
    it('suppression de l’utilisateur', async () => {
        const nbUsersBefore = await prisma.user.count()

        const deletedUser = await deleteUser(user.id)
        expect(deletedUser).toHaveProperty('id', user.id)

        const nbUsersAfter = await prisma.user.count()
        expect(nbUsersAfter).toBe(nbUsersBefore - 1)
    })
})