// src/app/api/actions/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const actions = await prisma.actions.findMany({
      orderBy: {
        id: 'asc'
      }
    });

    return NextResponse.json(actions);
  } catch (error) {
    console.error('[API] Erreur lors de la récupération des actions:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des actions' },
      { status: 500 }
    );
  }
}