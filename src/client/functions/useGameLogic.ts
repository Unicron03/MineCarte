import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

// --- Types et datas ---
import { InGameCard, GameState, AttackSelection } from "../../components/utils/typesPvp";
import { actionList } from "@/components/utils/data";
import { useCurrentUser } from "@/app/hooks/use-current-user";

// --- Lib ---
import { getSocket, closeSocket } from "@/client/sockets/socket";


// Je génère un identifiant unique pour l'utilisateur mais quand la base de donné sera prete, il faudra le récupérer depuis la base de donnée
export function getOrCreateUserId(): string {
    let id = localStorage.getItem("userId");
    if (!id) {
        id = crypto.randomUUID(); // identifiant unique aléatoire
        localStorage.setItem("userId", id);
    }
    return id;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useGameLogic = (initialDeck: any[] | null) => {
    const { userId: dbUserId } = useCurrentUser();
    const socket = getSocket();
    const router = useRouter();
    const pathname = usePathname();
    
    // --- États du composant ---
    const [endGameResult, setEndGameResult] = useState<"win" | "lose" | "draw" | null>(null);
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [myId, setMyId] = useState<string>("");
    const [logs, setLogs] = useState<string[]>([]);
    const [yourTurn, setYourTurn] = useState(false);
    const [usedAttacks, setUsedAttacks] = useState<number[]>([]);
    const [attackSelection, setAttackSelection] = useState<AttackSelection | null>(null);

    // --- Persistence: usedAttacks ---
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
        if (!initialDeck) return; // Attendre que le deck soit chargé

        const onConnect = () => {
            setMyId(socket.id ?? "");
            const userId = getOrCreateUserId();
            // On envoie le deck formaté au serveur
            socket.emit("registerUser", { userId, socketId: socket.id, dbUserId, deck: initialDeck });
        };

        if (socket.connected) {
            onConnect();
        } else {
            socket.on("connect", onConnect);
        }
        
        socket.on("waiting", () => {
            setLogs((prev) => [...prev, "En attente d’un adversaire..."]);
            setGameState(null);
        });
        
        socket.on("roomInfo", () => {});
        
        socket.on("gameStart", () => {
            setLogs((prev) => [...prev, "La partie commence !"]);
        });
        
        socket.on("yourTurn", () => {
            setYourTurn(true); 
            setUsedAttacks([]); // reset les attaques utilisées
            localStorage.setItem("usedAttacks", "[]");
            setLogs((prev) => [...prev, "C’est ton tour !"]);
        });

        socket.on("yourTurnNoAttack", () => {
            setYourTurn(true); 
            setLogs((prev) => [...prev, "C’est ton tour !"]);
        });
        
        socket.on("opponentTurn", () => {
            setYourTurn(false);
            setLogs((prev) => [...prev, "Tour de l’adversaire"]);
        });
        
        socket.on("log", (msg: string) => {
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
            socket.off("connect", onConnect);
            socket.off("waiting");
            socket.off("roomInfo");
            socket.off("gameStart");
            socket.off("yourTurn");
            socket.off("yourTurnNoAttack");
            socket.off("opponentTurn");
            socket.off("log");
            socket.off("updateState");
            socket.off("victory");
            socket.off("defeat");
            socket.off("draw");
            socket.off("opponentLeft");
        };
    }, [socket, initialDeck, dbUserId]);
    
    // --- Déconnexion si on quitte la page ---
    useEffect(() => {
        if (!pathname) return;
        if (pathname !== "/combats/pvp1V1") {
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
    }, [gameState, endGameResult, router, socket]);

    
    // --- Fonctions de jeu (Handlers) ---
    const playCard = useCallback((cardIndex: number) => {
        if (endGameResult) return;
        if (gameState) socket.emit("playCard", { roomId: gameState.roomId, cardIndex });
    }, [gameState, endGameResult, socket]);


    const attack = useCallback((card: InGameCard, attackName: string, attackerIndex: number) => {
        if (!gameState) return;
        if (endGameResult) return;

        const action = actionList.find((a) => a.name === attackName);
        const opponentBoard = gameState.players.find((p) => p.id !== myId)?.board ?? [];

        if (usedAttacks.includes(attackerIndex)) return; 

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
    }, [gameState, endGameResult, usedAttacks, myId, socket]);

    // Fonction pour gérer le clic sur une carte cible adverse
    const targetCard = useCallback((card: InGameCard, targetIndex: number) => {
        if (!attackSelection || !gameState) return;

        const attackerIndex = attackSelection.attackerIndex;
        if (attackerIndex === undefined || attackerIndex === -1) return;

        socket.emit("attack", {
            roomId: gameState.roomId,
            attackerIndex,
            attackName: attackSelection.attackName,
            targetIndex,
        });

        if (attackerIndex !== undefined) {
            setUsedAttacks(prev => [...prev, attackerIndex]);
        }

        setLogs((prev) => [
            ...prev,
            ` ${attackSelection.attackName} sur ${card.name} (slot ${targetIndex})`,
        ]);

        setAttackSelection(null);
    }, [attackSelection, gameState, socket]);


    const endTurn = useCallback(() => {
        if (attackSelection) {
            setLogs(prev => [...prev, "Vous devez d’abord choisir une cible !"]);
            return;
        }
        if (endGameResult) return;
        if (gameState) socket.emit("endTurn", { roomId: gameState.roomId });
    }, [attackSelection, endGameResult, gameState, socket]);


    const quitHandler = useCallback(() => {
        if (gameState?.roomId) {
            socket.emit("quit", { roomId: gameState.roomId });
        }
        closeSocket();
        router.push("/");
    }, [gameState?.roomId, socket, router]);

    const cancelOffensiveArtifact = useCallback(() => {
        socket.emit("cancelOffensiveArtifact");
    }, [socket]);


    const me = gameState?.players.find((p) => p.id === myId);
    const opponent = gameState?.players.find((p) => p.id !== me?.id);

    return {
        // États
        endGameResult,
        gameState,
        myId,
        logs,
        yourTurn,
        usedAttacks,
        attackSelection,
        me,
        opponent,
        
        // Handlers (fonctions à appeler depuis le composant)
        playCard,
        attack,
        targetCard,
        cancelOffensiveArtifact,
        endTurn,
        quitHandler,
    };
};
