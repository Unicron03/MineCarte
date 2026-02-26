// src/server/functions/gestionVictoire.ts

/**
 * Applique le résultat d'un match pour un joueur
 * @param userId ID de l'utilisateur
 * @param isWinner true si victoire, false si défaite
 */
export async function appliquerResultatMatch(
  userId: string | undefined,
  isWinner: boolean
): Promise<{ pointsChange: number; keysChange: number } | null> {
  if (!userId) {
    console.log('[GestionVictoire] Pas de userId, skip');
    return null;
  }

  try {
    const apiUrl = process.env.API_URL || 'http://app:3000';
    const response = await fetch(`${apiUrl}/api/match-result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, isWinner })
    });

    if (!response.ok) {
      console.error('[GestionVictoire] Erreur API:', response.status);
      return null;
    }

    const result = await response.json();
    console.log(`[GestionVictoire] ${isWinner ? 'Victoire' : 'Défaite'} pour ${userId}:`, result);
    
    return {
      pointsChange: result.pointsChange || 0,
      keysChange: result.keysChange || 0
    };

  } catch (error) {
    console.error('[GestionVictoire] Erreur:', error);
    return null;
  }
}