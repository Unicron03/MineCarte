"use client";

import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { Card, Player, GameState } from '@/types';

export default function GamePage() {
  const socket = getSocket();

  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myId, setMyId] = useState<string>("");
  const [logs, setLogs] = useState<string[]>([]);
  const [yourTurn, setYourTurn] = useState(false);

  useEffect(() => {
    // une seule fois : à la connexion
    socket.on("connect", () => {
      console.log(" Connecté au serveur avec id:", socket.id);
      setMyId(socket.id);
    });

    socket.on("waiting", () => {
      setLogs((prev) => [...prev, " En attente d’un adversaire..."]);
    });

    socket.on("gameStart", () => {
      setLogs((prev) => [...prev, " La partie commence !"]);
    });

    socket.on("yourTurn", () => {
      setYourTurn(true);
      setLogs((prev) => [...prev, " C’est ton tour !"]);
    });

    socket.on("opponentTurn", () => {
      setYourTurn(false);
      setLogs((prev) => [...prev, " Tour de l’adversaire"]);
    });

    socket.on("log", (msg: string) => {
      setLogs((prev) => [...prev, msg]);
    });

    socket.on("updateState", (state: GameState) => {
      console.log("📡 Nouvel état reçu:", state);
      setGameState(state);
    });

    return () => {
      socket.off("connect");
      socket.off("waiting");
      socket.off("gameStart");
      socket.off("yourTurn");
      socket.off("opponentTurn");
      socket.off("log");
      socket.off("updateState");
    };
  }, [socket]);

  if (!gameState) {
    return <div className="p-4">Connexion...</div>;
  }

  const me = gameState.players.find((p) => p.id === myId);
  const opponent = gameState.players.find((p) => p.id !== myId);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold"> Jeu de cartes</h1>

      <p>{yourTurn ? " À toi de jouer" : " En attente..."}</p>

      {/* Coût affiché */}
      <p className="text-green-600"> Coût dispo : {me?.cost ?? 0}</p>

      {/* Ma main */}
      <div>
        <h2 className="font-semibold">Main</h2>
        <div className="flex gap-2">
          {me?.hand.map((card, i) => (
            <div key={i} className="border p-2 rounded">
              <p>{card.name}</p>
              <p>cout {card.cost}</p>
              <p>attaque {card.attack}</p>
              {yourTurn && (
                <button
                  className="bg-blue-500 text-white px-2 py-1 rounded"
                  onClick={() =>
                    socket.emit("playCard", { roomId: gameState.roomId, card })
                  }
                >
                  Jouer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mon board */}
      <div>
        <h2 className="font-semibold">Board</h2>
        <div className="flex gap-2">
          {me?.board.map((card, i) => (
            <div key={i} className="border p-2 rounded">
              <p>{card.name}</p>
              <p>attaque {card.attack}</p>
              {yourTurn && (
                <button
                  className="bg-red-500 text-white px-2 py-1 rounded"
                  onClick={() =>
                    socket.emit("attack", { roomId: gameState.roomId, card })
                  }
                >
                  Attaquer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Board adverse */}
      <div>
        <h2 className="font-semibold">Adversaire</h2>
        <p>cout Coût : {opponent?.cost ?? 0}</p>
        <div className="flex gap-2">
          {opponent?.board.map((card, i) => (
            <div key={i} className="border p-2 rounded bg-gray-100">
              <p>{card.name}</p>
              <p>attaque {card.attack}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bouton fin du tour */}
      {yourTurn && (
        <button
          className="bg-gray-700 text-white px-4 py-2 rounded"
          onClick={() => socket.emit("endTurn", { roomId: gameState.roomId })}
        >
          Fin du tour
        </button>
      )}

      {/* Logs, a supprimer*/}
      <div className="bg-gray-100 p-2 rounded h-32 overflow-y-auto">
        {logs.map((l, i) => (
          <p key={i}>{l}</p>
        ))}
      </div>

      <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => { socket.emit("quit", { roomId: gameState.roomId }); window.location.href = "/"; }} >Quitter</button>

    </div>
  );
}
