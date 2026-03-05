import { prisma } from './prisma';

export async function initializeUserData(userId: string) {
    // Créer l'inventaire
    await prisma.inventory.upsert({
        where: { user_id: userId },
        update: {},
        create: {
            user_id: userId,
            keys: 0
        }
    });

    // Créer les game_stats
    const gameModes = ['ONE_V_ONE', 'IA_V_ONE', 'DONJON', 'VAGUES'] as const;
    
    for (const mode of gameModes) {
        await prisma.game_stats.upsert({
            where: {
                user_id_game_mode: {
                    user_id: userId,
                    game_mode: mode
                }
            },
            update: {},
            create: {
                user_id: userId,
                game_mode: mode,
                nb_party: 0,
                victories: 0,
                defeats: 0,
                points: 0
            }
        });
    }
}