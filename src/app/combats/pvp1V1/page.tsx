"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Composants ---
import Deck from "@/components/PVP/Deck";
import CardPVP from "@/components/PVP/CardPVP";
// EffectDisplay supprimé car intégré dans LeftPanel
import LeftPanel from "@/components/PVP/LeftPanel";
import GameLogs from "@/components/PVP/GameLogs";
import EndGameScreen from "@/components/PVP/EndGameScreen";
import LoadingScreen from "@/components/PVP/LoadingScreen";
import PlayerHand from "@/components/PVP/PlayerHand";
import AlertPopup from "@/components/PVP/AlertPopup";
import EffectDetailsModal from "@/components/PVP/EffectDetailsModal";
import TurnIndicator from "@/components/PVP/TurnIndicator";

// --- Lib ---
import { getSocket, closeSocket } from "@/client/sockets/socket"; 

// --- Nouveau Hook ---
import { useGameLogic } from "@/client/functions/useGameLogic";

import SelectionModal from "@/components/PVP/SelectionModal";
import { actionList } from "@/data";
import { InGameCard } from "@/typesPvp";

export default function GamePage() {
    // On récupère les infos de base, mais on va surcharger la logique d'attaque
    const { endGameResult, gameState, logs, yourTurn, me, opponent, playCard, endTurn, quitHandler, cancelOffensiveArtifact } = useGameLogic();
    
    const router = useRouter(); 
    const socket = getSocket();

    // --- États locaux pour gérer la sélection de cible demandée par le serveur ---
    const [selectionMode, setSelectionMode] = useState<'none' | 'ally' | 'enemy'>('none');
    const [pendingAttack, setPendingAttack] = useState<{ attackerIndex: number; attackName: string } | null>(null);

    // --- État générique pour la modale de sélection ---
    const [selectionModalData, setSelectionModalData] = useState<{ 
        show: boolean; 
        actionType: string;
        cardName: string; 
        message: string;
        targets: any[] 
    } | null>(null);

    // --- État pour les alertes (ex: pas assez d'énergie) ---
    const [alertMessage, setAlertMessage] = useState<string | null>(null);

     // --- État pour la modale de détails (Effets/Equipements) ---
    const [detailsModal, setDetailsModal] = useState<{
        show: boolean;
        title: string;
        description: string;
        imageName: string;
        type: "effect" | "equipment" | "talent";
    } | null>(null);

    useEffect(() => {
        if (!socket) return;

        // Écoute générique de demande de sélection
        socket.on("requestTargetSelection", (data: any) => {
            setSelectionModalData({ ...data, show: true });
        });

        // --- Nouveaux écouteurs pour l'attaque ---
        socket.on("selectAllyTarget", (data: { attackerIndex: number; attackName: string }) => {
            setSelectionMode('ally');
            setPendingAttack(data);
        });

        socket.on("selectEnemyTarget", (data: { attackerIndex: number; attackName: string }) => {
            setSelectionMode('enemy');
            setPendingAttack(data);
        });

        // --- Écoute des erreurs serveur ---
        socket.on("error", (data: { message: string } | string) => {
            const msg = typeof data === 'string' ? data : data.message;
            setAlertMessage(msg || "Une erreur est survenue.");
        });

        // --- Écoute des logs pour afficher les alertes (ex: Pas assez d'énergie) ---
        socket.on("log", (message: string) => {
            // On filtre les messages qui semblent être des erreurs ou des avertissements
            const lowerMsg = message.toLowerCase();
            if (
                lowerMsg.includes("pas assez d'énergie") ||
                lowerMsg.includes("impossible") ||
                lowerMsg.includes("erreur") ||
                lowerMsg.includes("ne pouvez pas") ||
                lowerMsg.includes("doit avoir")
            ) {
                setAlertMessage(message);
            }
        });

        return () => {
            socket.off("requestTargetSelection");
            socket.off("selectAllyTarget");
            socket.off("selectEnemyTarget");
            socket.off("error");
            socket.off("log");
        };
    }, [socket]);

    // --- Sécurité : Réinitialiser la sélection si le tour se termine (ex: timeout) ---
    useEffect(() => {
        if (!yourTurn) {
            setSelectionMode('none');
            setPendingAttack(null);
            setSelectionModalData(null);
        }
    }, [yourTurn]);

    // --- Handlers ---
    const handleCancelSelection = () => {
        socket.emit("cancelTarget");
        setSelectionModalData(null);
    };

    const handleTargetSelected = (targetIndex: number) => {
        socket.emit("targetSelected", { targetIndex });
        setSelectionModalData(null);
    };

    // Nouvelle fonction pour initier l'attaque
    const handleRequestAttack = (attackerIndex: number, attackName: string) => {
        if (!gameState || !me) return;

        socket.emit("requestAttack", { 
            roomId: gameState.roomId, 
            attackerIndex, 
            attackName 
        });
    };

    // Nouvelle fonction pour utiliser le talent
    const handleUseTalent = (cardUuid: string) => {
        if (!gameState) return;
        socket.emit("useTalent", { cardUuid });
    };

    // Nouvelle fonction pour gérer le clic sur une cible potentielle
    const handleTargetClick = (targetIndex: number, isOpponent: boolean) => {
        if (!pendingAttack || !gameState) return;

        // Si on doit choisir un allié et qu'on clique sur un allié (pas opponent)
        if (selectionMode === 'ally' && !isOpponent) {
            socket.emit("attack", {
                roomId: gameState.roomId,
                attackerIndex: pendingAttack.attackerIndex,
                attackName: pendingAttack.attackName,
                targetIndex: targetIndex
            });
            setSelectionMode('none');
            setPendingAttack(null);
        }
        // Si on doit choisir un ennemi et qu'on clique sur un ennemi
        else if (selectionMode === 'enemy' && isOpponent) {
            socket.emit("attack", {
                roomId: gameState.roomId,
                attackerIndex: pendingAttack.attackerIndex,
                attackName: pendingAttack.attackName,
                targetIndex: targetIndex
            });
            setSelectionMode('none');
            setPendingAttack(null);
        }
    };

    // --- Wrapper pour jouer une carte avec validation locale ---
    const handlePlayCardWrapper = (cardIndex: number) => {
        if (!me) return;
        playCard(cardIndex);
    };

    // --- Gestionnaire de clic sur un effet ---
    const handleEffectClick = (effectName: string) => {
        let title = effectName;
        let description = "Un effet mystérieux.";
        
        // 1. Vérifier si c'est un effet standard connu (Burn, etc.)
        if (effectName.startsWith("Burn_")) {
            const dmg = effectName.split("_")[1];
            title = "Brûlure";
            description = `Cette unité subit ${dmg} dégâts à la fin de son tour.`;
        } else if (effectName === "Esquive") {
            title = "Esquive";
            description = "La prochaine attaque subie sera ignorée.";
        } else if (effectName === "Invisible") {
            title = "Invisibilité";
            description = "Cette unité ne peut pas être ciblée par des attaques adverses.";
        } else if (effectName.startsWith("GoldenApple_")) {
            title = "Pomme Dorée";
            description = "Bonus de dégâts et régénération.";
        } else {
            // 2. Chercher dans la liste des actions/cartes
            const action = actionList.find(a => a.name === effectName || a.function === effectName);
            if (action) {
                title = action.name;
                description = action.description || description;
            }
        }

        setDetailsModal({
            show: true,
            title,
            description,
            imageName: effectName,
            type: "effect"
        });
    };

    // --- Gestionnaire de clic sur un équipement ---
    const handleEquipmentClick = (equipment: InGameCard) => {
        let title = equipment.name;
        let description = "Aucune description.";
        
        // On cherche la description dans actionList via le nom ou l'effet
        const action = actionList.find(a => a.name === equipment.name || (equipment.category !== "mob" && a.name === equipment.effet));
        
        if (action) {
            description = action.description || description;
        }

        setDetailsModal({
            show: true,
            title,
            description,
            imageName: equipment.imageName,
            type: "equipment"
        });
    };

    const closeDetailsModal = () => {
        setDetailsModal(null);
    };

    // --- Rendu écran chargement de partie ---
    if (!gameState) {
        return <LoadingScreen />;
    }

    // --- Rendu de l'écran de fin de partie ---
    if (endGameResult) {
        return (
            <EndGameScreen 
                result={endGameResult} 
                onQuit={() => {
                    closeSocket();
                    router.push("/");
                }} 
            />
        );
    }

    const deckSize = me?.deck?.length || 0;
    const opponentDeckSize = opponent?.deck?.length || 0;

    return (
        <div style={{ backgroundImage: "url('/img/backgroundPVP.jpg')" }} className="relative h-screen w-full bg-cover bg-center bg-no-repeat overflow-hidden flex flex-row justify-between p-4" > 
            {/* --- INDICATEUR DE TOUR --- */}
            <TurnIndicator isMyTurn={yourTurn} />

            {/* --- PANEL GAUCHE (Maintenant divisé en deux blocs absolus) --- */}
            <LeftPanel 
                me={me ?? null} 
                opponent={opponent ?? null} 
                onQuit={quitHandler} 
                onEffectClick={handleEffectClick}
            />
        
            {/* --- CONTENU PRINCIPAL --- */}
            <div className="flex-1 flex flex-col items-center justify-between">

                {/* Logs en haut à droite */}
                <GameLogs logs={logs} />
            
                {/* Zone adversaire */}
                <div className="w-full flex flex-col items-center ">

                    {/* Effets adversaire déplacés dans LeftPanel */}
                    
                    {/* Main adversaire */}
                    <Deck count={opponent?.hand?.length ?? 0} opponent={true} />

                    {/* Deck Adversaire */} 
                    <div style={{ position: 'absolute', left: '300px', top: '20px', width: '120px', height: `${180 + opponentDeckSize * 4}px`}}>
                        {Array.from({ length: opponentDeckSize }).map((_, index) => (
                            <img
                            key={index}
                            src="/cards/back.png"
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
                    <div className="flex justify-center gap-16 -mt-6">
                    {opponent?.board?.length ? (
                        opponent.board.map((card, i) => (
                        <div
                            key={i}
                            className={`relative ${
                                // On met en évidence si on doit choisir un ennemi
                                selectionMode === 'enemy' ? "cursor-pointer hover:scale-105 transition-transform border-2 border-red-500 rounded-lg animate-pulse" : ""
                            }`}
                            // Clic pour valider la cible ennemie
                            onClick={() => handleTargetClick(i, true)}
                        >
                            <CardPVP
                                card={card}
                                overrides={{
                                    cost: card.cost,
                                    pv_durability: card.pv_durability,
                                }}
                                clickable={false}
                                onEffectClick={handleEffectClick}
                                onEquipmentClick={handleEquipmentClick}
                            />
                        </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400">Aucune carte sur le board ennemi</p>
                    )}
                    </div>
                </div>
            
                {/* Zone joueur */}
                <div className="w-full flex flex-col items-center">
                    
                    {/* Effets joueur déplacés dans LeftPanel */}

                    <div className="flex justify-center gap-16 mb-17">
                    {me?.board?.length ? (
                        me.board.map((card, i) => {
                        const alreadyAttacked = card.hasAttacked ?? false;
                        return (
                        <div 
                            key={i} 
                            className={`relative ${
                                // On met en évidence si on doit choisir un allié (soin)
                                selectionMode === 'ally' ? "cursor-pointer hover:scale-105 transition-transform border-2 border-green-500 rounded-lg animate-pulse" : ""
                            }`}
                            // Clic pour valider la cible alliée
                            onClick={() => handleTargetClick(i, false)}
                        >
                        <CardPVP
                            card={card}
                            isPlayer={true}
                            overrides={{
                                cost: card.cost,
                                pv_durability: card.pv_durability,
                            }}
                            // On active le clic si c'est notre tour (la gestion fine attaque/talent est faite dans CardPVP)
                            clickable={yourTurn && selectionMode === 'none'}
                            // Appel de la demande d'attaque
                            onAttackClick={(attackName) => handleRequestAttack(i, attackName)}
                            onTalentClick={() => handleUseTalent(card.uuid)}
                            onEffectClick={handleEffectClick}
                            onEquipmentClick={handleEquipmentClick}
                        />
                        </div>
                        )})
                    ) : (
                        <p className="text-sm text-gray-400">Aucune carte sur le board</p>
                    )}
                    </div>

                    {/* Mon Deck */} 
                    <div style={{ position: 'absolute', left: '300px', bottom: '20px', width: '120px', height: `${180 + deckSize * 4}px` }}>
                        {Array.from({ length: deckSize }).map((_, index) => (
                            <img
                            key={index}
                            src="/cards/back.png"
                            alt="Carte du deck"
                            style={{
                                position: 'absolute',
                                top: `${index * 2}px`, // Décalage vertical
                                right: `${index * 2}px`, // On garde le décalage interne vers la droite pour l'effet de pile
                                width: '120px',
                                height: '180px',
                                zIndex: index,
                            }}
                            />
                        ))}
                    </div>
            
                    {/* Main du joueur (Nouvelle version) */}
                    <PlayerHand 
                        hand={me?.hand || []} 
                        onPlayCard={handlePlayCardWrapper} 
                        isMyTurn={yourTurn} 
                        selectionMode={selectionMode}
                    />

                </div>
            </div>

            {yourTurn && (
                <button
                    className={`absolute right-6 top-1/2 -translate-y-1/2 font-bold text-xl px-8 py-4 rounded-xl border-2 shadow-2xl transition-all z-50 ${
                        (selectionMode !== 'none' || selectionModalData?.show)
                            ? "bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white border-yellow-400 hover:scale-110"
                    }`}
                    onClick={(selectionMode !== 'none' || selectionModalData?.show) ? undefined : endTurn}
                    disabled={selectionMode !== 'none' || (selectionModalData?.show ?? false)}
                >
                    FIN DU TOUR
                </button>
            )}

            {/* --- MODALE DE SÉLECTION GÉNÉRIQUE --- */}
            {selectionModalData && (
                <SelectionModal
                    isOpen={selectionModalData.show}
                    title={selectionModalData.cardName}
                    message={selectionModalData.message}
                    targets={selectionModalData.targets}
                    onSelect={handleTargetSelected}
                    onCancel={handleCancelSelection}
                    borderColor={
                        selectionModalData.actionType === "OFFENSIVE_ARTIFACT" 
                        ? "border-red-500" 
                        : "border-yellow-500"
                    }
                />
            )}

            {/* --- POPUP D'ALERTE --- */}
            <AlertPopup
                isOpen={!!alertMessage}
                message={alertMessage}
                onClose={() => setAlertMessage(null)}
            />

            {/* --- MODALE DÉTAILS EFFET/EQUIPEMENT --- */}
            {detailsModal && (
                <EffectDetailsModal
                    isOpen={detailsModal.show}
                    title={detailsModal.title}
                    description={detailsModal.description}
                    imageName={detailsModal.imageName}
                    type={detailsModal.type}
                    onClose={closeDetailsModal}
                />
            )}
        </div>
    );
}
