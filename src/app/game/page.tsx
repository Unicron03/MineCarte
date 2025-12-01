"use client"; 

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

// --- Types et datas ---
import { InGameCard, GameState} from "@/types"; // J'ai remplacer card par InGameCard au lieu de CollectionCard
import { actionList } from "@/data";

// --- Composants ---
import Deck from "../../components/combats/Deck";
import CardPVP from "@/components/CardPVP";

// --- Lib ---
import { getSocket, closeSocket } from "@/lib/socket";
import { getOrCreateUserId} from "@/lib/utilsCombat";




export default function GamePage() {
    const socket = getSocket();
    const router = useRouter();
    const pathname = usePathname();
    const [endGameResult, setEndGameResult] = useState<"win" | "lose" | "draw" | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null); // contient (joueurs, cartes, tour, ...)
    const [myId, setMyId] = useState<string>(""); // stoque Id du joueur
    const [logs, setLogs] = useState<string[]>([]); // liste des logs
    const [yourTurn, setYourTurn] = useState(false); // booléen qui dit si le joueur peut jouer 
    const [usedAttacks, setUsedAttacks] = useState<number[]>([]);

    type AttackSelection = {
        attackerIndex: number;
        attackName: string | null;
    };
    const [attackSelection, setAttackSelection] = useState<AttackSelection | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem("usedAttacks");
        if (saved) {
            setUsedAttacks(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("usedAttacks", JSON.stringify(usedAttacks));
    }, [usedAttacks]);

    
    // --- Gestion des évènements Socket ---
    useEffect(() => {
        // Le client écoute le serveur 
        socket.on("connect", () => { // Si il entend qu'il est connecté
            setMyId(socket.id ?? ""); // Il récupère l'id du socket
            const userId = getOrCreateUserId();
            socket.emit("registerUser", { userId, socketId: socket.id });
        });
        
        socket.on("waiting", () => { // Si il entend attend
            setLogs((prev) => [...prev, "En attente d’un adversaire..."]); // Il dit d'attendre
            setGameState(null);
        });
        
        socket.on("roomInfo", (info: { roomId: string }) => {});
        
        socket.on("gameStart", () => { // Si il entend la partie commence
            setLogs((prev) => [...prev, "La partie commence !"]);
        });
        
        socket.on("yourTurn", () => { // Si il entend c'est à ton tour
            setYourTurn(true); 
            setUsedAttacks([]); // reset les attaques utilisées
            localStorage.setItem("usedAttacks", "[]");  // <-- AJOUT
            setLogs((prev) => [...prev, "C’est ton tour !"]);
        });

        socket.on("yourTurnNoAttack", () => { // Si c'était au tour du joueur qui revient en cours de partie
            setYourTurn(true); 
            setLogs((prev) => [...prev, "C’est ton tour !"]);
        });
        
        socket.on("opponentTurn", () => { // Si il entend c'est au tour de l'adversaire
            setYourTurn(false);
            setLogs((prev) => [...prev, "Tour de l’adversaire"]);
        });
        
        socket.on("log", (msg: string) => { // Si il entend un log
            setLogs((prev) => [...prev, msg]);
        });

        socket.on("updateState", (state: GameState) => {
            setGameState(state);
        });

        socket.on("victory", () => {
            setEndGameResult("win");
            setLogs(prev => [...prev, "Vous avez gagné !"]);
        });

        socket.on("defeat", () => {
            setEndGameResult("lose");
            setLogs(prev => [...prev, "Vous avez perdu..."]);
        });

        socket.on("draw", () => {
            setEndGameResult("draw");
            setLogs(prev => [...prev, "Égalité !"]);
        });

        socket.on("opponentLeft", () => {
            setEndGameResult("win");
            setLogs(prev => [...prev, "Votre adversaire a quitté."]);
        });

        
        return () => {
            // On retire tous les écouteur quand on quitte la page
            socket.off("connect");
            socket.off("waiting");
            socket.off("roomInfo");
            socket.off("gameStart");
            socket.off("yourTurn");
            socket.off("opponentTurn");
            socket.off("log");
            socket.off("updateState");
            socket.off("victory");
            socket.off("defeat");
            socket.off("draw");
            socket.off("opponentLeft");
        };
    }, [socket]);
    
    // --- Déconnexion si on quitte la page ---
    useEffect(() => {
        if (!pathname) return;
        if (pathname !== "/game") {
            if (gameState?.roomId) {
                socket.emit("quit", { roomId: gameState.roomId });
            }
            closeSocket();
        }
    }, [pathname, gameState?.roomId, socket]);
    
    // --- Déconnexion si on ferme la fenêtre ---
    useEffect(() => {
        const handler = () => {};
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [gameState?.roomId, socket]);
    
    // --- Empêcher retour sans confirmation ---
    useEffect(() => {
        const onPop = (e: PopStateEvent) => {
            if (gameState && !endGameResult) {
                e.preventDefault();
                const confirmQuit = confirm(
                    "Vous êtes dans une partie — quitter et abandonner la partie ?"
                );
                if (confirmQuit) {
                    socket.emit("quit", { roomId: gameState.roomId });
                    closeSocket();
                    router.push("/");
                } else {
                    window.history.pushState(null, "", window.location.href);
                }
            }
        };
        window.history.pushState(null, "", window.location.href);
        window.addEventListener("popstate", onPop);
        return () => window.removeEventListener("popstate", onPop);
    }, [gameState, endGameResult]);

    

    // --- Jouer une carte --- (peut être le modifier plus tard car je peut avoir plusieur même carte dans la main)
    const playCard = (card: InGameCard) => {
        if (endGameResult) return;
        gameState && socket.emit("playCard", { roomId: gameState.roomId, card });
    };

    // --- Action d'attaque --- 
    const attack = (card: InGameCard, attackName: string, attackerIndex: number) => {
        if (!gameState) return;
        if (endGameResult) return;


        const action = actionList.find((a) => a.name === attackName);
        const opponentBoard = gameState.players.find((p) => p.id !== myId)?.board ?? [];

        if (usedAttacks.includes(attackerIndex)) return; // carte déjà attaqué


        // Si aucune carte adverse, attaque directe
        if (opponentBoard.length === 0) {
            socket.emit("attack", {
                roomId: gameState.roomId,
                attackerIndex,
                attackName,
                targetIndex: null,
            });
            if (attackerIndex !== undefined) {
                setUsedAttacks(prev => [...prev, attackerIndex]);
            }
            setLogs((prev) => [
                ...prev,
                ` ${attackName} de ${card.name} attaque directement l’adversaire !`,
            ]);
            setAttackSelection(null);
            return;
        }

        // Si attaque multi-cible
        if (action?.multiTarget) {
            socket.emit("attack", {
                roomId: gameState.roomId,
                attackerIndex,
                attackName,
                targetIndex: null,
            });

            if (attackerIndex !== undefined) {
                setUsedAttacks(prev => [...prev, attackerIndex]);
            }

            setLogs((prev) => [
                ...prev,
                ` ${attackName} de ${card.name} touche toutes les cibles ennemies !`,
            ]);
            return;
        }

        // Sinon, sélection d'une cible manuelle
        setAttackSelection({ attackerIndex, attackName });
        setLogs((prev) => [
            ...prev,
            `Choisissez une cible pour ${attackName} de ${card.name}...`,
        ]);
    };


    // --- Fin du tour --- 
    const endTurn = () => {
        if (attackSelection) {
            setLogs(prev => [...prev, "Vous devez d’abord choisir une cible !"]);
            return;
        }
        if (endGameResult) return;
        gameState && socket.emit("endTurn", { roomId: gameState.roomId });
    };


    // --- Quitter la partie ---
    const quitHandler = () => {
        if (gameState?.roomId) {
            socket.emit("quit", { roomId: gameState.roomId });
        }
        closeSocket();
        router.push("/");
    };
    
    // --- Rendu écran chargement de partie ---
    if (!gameState) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
            Connexion au serveur...
            </div>
        );
    }

    // --- Rendu de l'écran de fin de partie ---
    if (endGameResult) {
        const text =
        endGameResult === "win"
            ? "Vous avez gagné !"
            : endGameResult === "lose"
            ? "Vous avez perdu..."
            : "Égalité";

        return (
        <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center text-white z-50">
            <h1 className="text-4xl font-bold mb-6">{text}</h1>

            <button
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg text-xl"
            onClick={() => {
                closeSocket();
                router.push("/");
            }}
            >
            Quitter la partie
            </button>
        </div>
        );
    }

    const me = gameState.players.find((p) => p.id === myId);
    const opponent = gameState.players.find((p) => p.id !== me?.id);
    const deckSize = me?.deck?.length || 0;
    const opponentDeckSize = opponent?.deck?.length || 0;

    return (
        <div
        style={{ backgroundImage: "url('/img/backgrounPVP.jpg')" }}
        className="relative min-h-screen bg-cover flex flex-row justify-between p-4"
        >
            {/* === PANEL GAUCHE === */}
            <div className="w-64 bg-black/70 text-white rounded-lg p-4 text-sm h-[90vh] overflow-y-auto border border-gray-600">
                <button
                onClick={quitHandler}
                className="mb-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                Quitter
                </button>
                
                <h3 className="text-lg font-bold mb-2 text-yellow-400"> Informations</h3>
                <div className="mb-4">
                    <h4 className="font-semibold text-green-400 mb-1">Vous</h4>
                    <p>Énergie : {me?.energie ?? 0}</p>
                    <p>Cartes dans le deck : {me?.deck?.length ?? 0}</p>
                    <p>Cartes en main : {me?.hand?.length ?? 0}</p>
                    <p>Cartes dans la défausse : {me?.discard?.length ?? 0}</p>
                    <p>Cartes sur le plateau : {me?.board?.length ?? 0}</p>
                    <p>PV : {me?.pv ?? 0}</p>

                </div>
        
                <div>
                    <h4 className="font-semibold text-red-400 mb-1">Adversaire</h4>
                    <p>Énergie : {opponent?.energie ?? 0}</p>
                    <p>Cartes dans le deck : {opponent?.deck?.length ?? 0}</p>
                    <p>Cartes en main : {opponent?.hand?.length ?? 0}</p>
                    <p>Cartes dans la défausse : {opponent?.discard?.length ?? 0}</p>
                    <p>Cartes sur le plateau : {opponent?.board?.length ?? 0}</p>
                    <p>PV : {opponent?.pv ?? 0}</p>
                </div>
            </div>
        
            {/* === CONTENU PRINCIPAL === */}
            <div className="flex-1 flex flex-col items-center justify-between">

                {/* Logs en haut à droite */}
                <div className="absolute top-2 right-2 w-64 h-48 bg-black/70 p-2 rounded-lg text-white text-xs overflow-y-auto font-mono">
                    {logs.map((l, i) => (
                        <p key={i}>{l}</p>
                    ))}
                </div>
            
                {/* Zone adversaire */}
                <div className="w-full flex flex-col items-center " style={{ border: "solid 1px red"}}>
                    <h2 className="text-lg font-mono text-white mb-2">Adversaire</h2>
                    
                    {/* Main adversaire */}
                    <Deck count={opponent?.hand?.length ?? 0} opponent={true} />

                    {/* Deck Adversaire */} 
                    <div style={{ position: 'absolute', left: '300px', top: '20px', width: '120px', height: `${180 + deckSize * 4}px`}}>
                        {Array.from({ length: opponentDeckSize }).map((_, index) => (
                            <img
                            key={index}
                            src="/card/back-card.png"
                            alt="Carte du deck"
                            style={{
                                position: 'absolute',
                                top: `${index * 2}px`, // Décalage vertical
                                right: `${index * 2}px`,
                                width: '120px',
                                height: '180px',
                                zIndex: index,
                            }}
                            />
                        ))}
                    </div>
                    
                    {/* Plateau adverse */}
                    <div className="flex gap-2">
                    {opponent?.board?.length ? (
                        opponent.board.map((card, i) => (
                        <div
                            key={i}
                            className={`relative ${
                            attackSelection ? "cursor-pointer hover:scale-105 transition-transform" : ""
                            }`}
                            onClick={() => {
                            // On clique n’importe où sur la carte pour la cibler
                            if (attackSelection && gameState) {
                                const attackerIndex = attackSelection.attackerIndex;
                                if (attackerIndex === undefined || attackerIndex === -1) return;

                                socket.emit("attack", {
                                roomId: gameState.roomId,
                                attackerIndex,
                                attackName: attackSelection.attackName,
                                targetIndex: i,
                                });

                                if (attackerIndex !== undefined) {
                                    setUsedAttacks(prev => [...prev, attackerIndex]);
                                }

                                setLogs((prev) => [
                                ...prev,
                                ` ${attackSelection.attackName} sur ${card.name} (slot ${i})`,
                                ]);

                                setAttackSelection(null);
                            }
                            }}
                        >
                            <CardPVP
                                card={card} // card est de type CardCombat
                                overrides={{
                                    cost: card.cost,
                                    pv_durability: card.pv_durability,
                                }}
                                clickable={false}
                            />
                            {attackSelection && (
                            <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-pulse pointer-events-none"></div>
                            )}
                        </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400">Aucune carte sur le board ennemi</p>
                    )}
                    </div>
            </div>
        
            {/* Zone joueur (A modifier car je doit je doit récuprer les attaques des carte talent ) */}
            <div className="w-full flex flex-col items-center">
                <h2 className="text-lg font-mono text-yellow-400 mb-2">Vous</h2>
                
                <div className="flex gap-2 mb-4">
                {me?.board?.length ? (
                    me.board.map((card, i) => {
                    const alreadyAttacked = usedAttacks.includes(i);
                    return (
                    <CardPVP
                        key={i}
                        card={card}
                        overrides={{
                            cost: card.cost,
                            pv_durability: card.pv_durability,
                        }}
                        clickable={yourTurn && !attackSelection && !alreadyAttacked} // désactive si on choisit une cible
                        onAttackClick={(attackName) => attack(card, attackName, i)} // <-- important
                    />
                    )})
                ) : (
                    <p className="text-sm text-gray-400">Aucune carte sur le board</p>
                )}
                </div>
        
                {/* Mon Deck */} 
                <div style={{ position: 'absolute', right: '50px', bottom: '20px', width: '120px', height: `${180 + deckSize * 4}px` }}>
                    {Array.from({ length: deckSize }).map((_, index) => (
                        <img
                        key={index}
                        src="/card/back-card.png"
                        alt="Carte du deck"
                        style={{
                            position: 'absolute',
                            top: `${index * 2}px`, // Décalage vertical
                            right: `${index * 2}px`,
                            width: '120px',
                            height: '180px',
                            zIndex: index,
                        }}
                        />
                    ))}
                </div>
        
                <div className="flex gap-2">
                    {me?.hand.map((card, i) => (
                    <div key={i}
                        className="card bg-[url('/card-front.png')] bg-cover border-2 border-blue-700 w-20 h-28 flex flex-col justify-end text-center text-xs"
                        >
                        <div className="bg-black/70 text-white">
                            <p>{card.name}</p>
                            <p>COST {card.cost}</p>
                        </div>
                        {yourTurn && !attackSelection && (
                            <button
                            className="bg-blue-600 text-white text-xs px-1 rounded"
                            onClick={() => playCard(card)}
                            >
                            Jouer
                            </button>
                        )}
                    </div>
                    ))}
                </div>

                {yourTurn && (
                    <button
                    className="mt-4 bg-gray-800 text-white px-4 py-2 rounded"
                    onClick={endTurn}
                    >
                    Fin du tour
                    </button>
                )}
            </div>
        </div>
    </div>
    );
}
