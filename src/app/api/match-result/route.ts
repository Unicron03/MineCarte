// src/app/api/match-result/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { userId, isWinner } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'userId requis' }, { status: 400 });
    }

    // Récupérer ou créer les stats du joueur
    let stats = await prisma.game_stats.findUnique({
      where: { user_id_game_mode: { user_id: userId, game_mode: 'ONE_V_ONE' } }
    });

    if (!stats) {
      try {
        stats = await prisma.game_stats.create({
          data: {
            user_id: userId,
            game_mode: 'ONE_V_ONE',
            points: 0,
            nb_party: 0,
            victories: 0,
            defeats: 0
          }
        });
      } catch (e) {
        // Si la création échoue (ex: user_id n'existe pas dans la table User), on ne peut pas continuer
        console.error('[API] Erreur création stats (User inexistant ?):', e);
        return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
      }
    }

    // Récupérer ou créer l'inventaire
    let inventory = await prisma.inventory.findUnique({
      where: { user_id: userId }
    });

    if (!inventory) {
      try {
        inventory = await prisma.inventory.create({
          data: { user_id: userId, keys: 0 }
        });
      } catch (e) {
        console.error('[API] Erreur création inventaire:', e);
      }
    }

    let pointsChange = 0;
    let keysChange = 0;
    let newStats;
    let newInventory = inventory;

    if (isWinner) {
      // VICTOIRE : +150 points, +2 clés, -1 défaite (compensation), +1 victoire
      pointsChange = 150;
      keysChange = 2;

      // On s'assure de ne pas décrémenter les défaites en dessous de 0 (sécurité)
      const defeatsDecrement = stats.defeats > 0 ? 1 : 0;

      [newStats, newInventory] = await prisma.$transaction([
        prisma.game_stats.update({
          where: { user_id_game_mode: { user_id: userId, game_mode: 'ONE_V_ONE' } },
          data: {
            points: { increment: pointsChange },
            victories: { increment: 1 },
            defeats: { decrement: defeatsDecrement }
          }
        }),
        prisma.inventory.update({
          where: { user_id: userId },
          data: { keys: { increment: keysChange } }
        })
      ]);
    } else {
      // DÉFAITE : -50 points, +1 défaite, +1 partie jouée
      pointsChange = -50;
      
      const newPoints = Math.max(0, stats.points + pointsChange);
      const actualChange = newPoints - stats.points;

      newStats = await prisma.game_stats.update({
          where: { user_id_game_mode: { user_id: userId, game_mode: 'ONE_V_ONE' } },
          data: {
            points: newPoints,
            defeats: { increment: 1 },
            nb_party: { increment: 1 }
          }
      });

      pointsChange = actualChange;
    }

    return NextResponse.json({
      success: true,
      pointsChange,
      keysChange,
      newPoints: newStats.points,
      newKeys: newInventory?.keys || 0
    });

  } catch (error) {
    console.error('[API] Erreur match-result:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
