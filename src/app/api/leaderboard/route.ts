import { NextResponse } from "next/server";
import { faker } from "@faker-js/faker";

export async function GET() {
    // Génère un tableau de 10 joueurs aléatoires
    const players = Array.from({ length: 10 }, () => ({
        id: faker.string.uuid(),
        name: faker.person.firstName(),
        points: faker.number.int({ min: 100, max: 10000 }),
    }));

    // Trie par score décroissant
    players.sort((a, b) => b.points - a.points);

    return NextResponse.json(players);
}