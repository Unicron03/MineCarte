import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getAllUserStats, getUserStatsForMode, getLeaderboard } from '@/prisma/requests'
import { prisma } from '@/lib/prisma'
import { Prisma } from '../../generated/prisma/client'
import { auth } from '@/lib/auth'

let user: Prisma.UserGetPayload<Record<string, never>>

beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: 'test_stats@gmail.com' } })

    await auth.api.signUpEmail({
        body: {
            email: 'test_stats@gmail.com',
            password: 'azertyuiop',
            name: 'testNameStats',
        }
    });

    const tempUser = await prisma.user.findUnique({
        where: { email: 'test_stats@gmail.com' },
    })
    
    if (tempUser) {
        user = tempUser
    } else {
        throw new Error('Utilisateur de test introuvable après création : test_stats@gmail.com')
    }

    await prisma.game_stats.createMany({
        data: [
            {
                user_id: user.id,
                game_mode: 'ONE_V_ONE',
                nb_party: 10,
                victories: 7,
                defeats: 3,
                points: 1500,
            },
            {
                user_id: user.id,
                game_mode: 'IA_V_ONE',
                nb_party: 5,
                victories: 5,
                defeats: 0,
                points: 1000,
            },
            {
                user_id: user.id,
                game_mode: 'DONJON',
                nb_party: 2,
                victories: 1,
                defeats: 1,
                points: 800,
            },
        ]
    });
})

describe('getAllUserStats', () => {
    it('récupération des statistiques de l’utilisateur', async () => {
        const stats = await getAllUserStats(user.id)
        expect(stats).toBeInstanceOf(Array)
        expect(stats.length).toBeGreaterThan(0)
        expect(stats[0]).toHaveProperty('game_mode')
        expect(stats[0]).toHaveProperty('nb_party')
        expect(stats[0]).toHaveProperty('victories')
        expect(stats[0]).toHaveProperty('defeats')
        expect(stats[0]).toHaveProperty('points')
    })
})

describe('getUserStatsForMode', () => {
    it('récupération des statistiques pour un mode de jeu spécifique', async () => {
        const stats = await getUserStatsForMode(user.id, 'DONJON');
        expect(stats).toHaveProperty('game_mode', 'DONJON')
        expect(stats).toHaveProperty('nb_party', 2)
        expect(stats).toHaveProperty('victories', 1)
        expect(stats).toHaveProperty('defeats', 1)
        expect(stats).toHaveProperty('points', 800)
    })
})

describe('getLeaderboard', () => {
    it('récupération du classement pour un mode de jeu spécifique', async () => {
        const duplicateUser = await auth.api.signUpEmail({
            body: {
                email: 'test_stats_leaderboard@gmail.com',
                password: 'azertyuiop',
                name: 'testName',
            }
        });
        await prisma.game_stats.create({
            data: {
                user_id: duplicateUser.user.id,
                game_mode: 'ONE_V_ONE',
                nb_party: 1,
                victories: 1,
                defeats: 0,
                points: 2000,
            }
        });

        const updatedLeaderboard = await getLeaderboard('ONE_V_ONE', 10);
        
        const duplicateUserStats = updatedLeaderboard.find((s: { user_id: string }) => s.user_id === duplicateUser.user.id)
        const userStats = updatedLeaderboard.find((s: { user_id: string }) => s.user_id === user.id)

        expect(duplicateUserStats).toBeDefined()
        expect(duplicateUserStats).toHaveProperty('points', 2000)
        
        expect(userStats).toBeDefined()
        expect(userStats).toHaveProperty('points', 1500)
    
        await prisma.user.deleteMany({ where: { email: 'test_stats_leaderboard@gmail.com' } })
    })
})

afterAll(async () => {
    await prisma.game_stats.deleteMany({ where: { user_id: user.id } })
    await prisma.user.deleteMany({ where: { email: 'test_stats@gmail.com' } })
    await prisma.user.deleteMany({ where: { email: 'test_stats_leaderboard@gmail.com' } })
})