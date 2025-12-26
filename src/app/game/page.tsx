"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// --- Composants ---
import Deck from "../../components/combats/Deck";
import CardPVP from "@/components/PVP/CardPVP";
import EffectDisplay from "@/components/PVP/EffectDisplay";

// --- Lib ---
import { getSocket, closeSocket } from "@/client/sockets/socket"; 

// --- Nouveau Hook ---
import { useGameLogic } from "@/client/functions/useGameLogic";

import { EquipmentBadge } from "@/components/PVP/EquipmentBadge";

export default function GamePage() {
    // On récupère les infos de base, mais on va surcharger la logique d'attaque
    const { endGameResult, gameState, logs, yourTurn, me, opponent, playCard, endTurn, quitHandler } = useGameLogic();
    
    const router = useRouter(); 
    const socket = getSocket();

    // --- États locaux pour gérer la sélection de cible demandée par le serveur ---
    const [selectionMode, setSelectionMode] = useState<'none' | 'ally' | 'enemy'>('none');
    const [pendingAttack, setPendingAttack] = useState<{ attackerIndex: number; attackName: string } | null>(null);

    // --- État pour la modale d'équipement ---
    const [equipmentModal, setEquipmentModal] = useState<{ show: boolean; cardName: string; targets: any[] } | null>(null);

    useEffect(() => {
        if (!socket) return;

        // Écoute de la demande de sélection de cible pour équipement
        socket.on("selectTargetForEquipment", (data: any) => {
            setEquipmentModal({
                show: true,
                cardName: data.cardName,
                targets: data.targets
            });
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

        return () => {
            socket.off("selectTargetForEquipment");
            socket.off("selectAllyTarget");
            socket.off("selectEnemyTarget");
        };
    }, [socket]);

    // --- Handlers ---

    const handleCancelEquipment = () => {
        socket.emit("cancelEquipment");
        setEquipmentModal(null);
    };

    const handleSelectEquipmentTarget = (targetIndex: number) => {
        socket.emit("selectTargetForEquipment", { targetIndex });
        setEquipmentModal(null);
    };

    // Nouvelle fonction pour initier l'attaque
    const handleRequestAttack = (attackerIndex: number, attackName: string) => {
        if (!gameState) return;
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

    const deckSize = me?.deck?.length || 0;
    const opponentDeckSize = opponent?.deck?.length || 0;

    return (
        <div style={{ backgroundImage: "url('/img/backgrounPVP.jpg')" }} className="relative min-h-screen bg-cover flex flex-row justify-between p-4" > 
            {/* --- PANEL GAUCHE --- */}
            <div className="w-64 bg-black/70 text-white rounded-lg p-4 text-sm h-[90vh] overflow-y-auto border border-gray-600">
                <button onClick={quitHandler} className="mb-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"> Quitter</button>  
                <h3 className="text-lg font-bold mb-2 text-yellow-400"> Informations</h3>
                <div className="mb-4">
                    <h4 className="font-semibold text-green-400 mb-1">Vous</h4>
                    <p>Énergie : {me?.energie ?? 0}</p>
                    <p>Cartes dans le deck : {me?.deck?.length ?? 0}</p>
                    <p>Cartes en main : {me?.hand?.length ?? 0}</p>
                    <p>Cartes dans la défausse : {me?.discard?.length ?? 0}</p>
                    <p>Cartes sur le plateau : {me?.board?.length ?? 0}</p>
                    <p>PV : {me?.pv ?? 0}</p>
                    <p>Effect : {me?.effects && me.effects.length > 0 ? me.effects.join(", ") : "Aucun"}</p>
                </div>
                <div>
                    <h4 className="font-semibold text-red-400 mb-1">Adversaire</h4>
                    <p>Énergie : {opponent?.energie ?? 0}</p>
                    <p>Cartes dans le deck : {opponent?.deck?.length ?? 0}</p>
                    <p>Cartes en main : {opponent?.hand?.length ?? 0}</p>
                    <p>Cartes dans la défausse : {opponent?.discard?.length ?? 0}</p>
                    <p>Cartes sur le plateau : {opponent?.board?.length ?? 0}</p>
                    <p>PV : {opponent?.pv ?? 0}</p>
                    <p>Effect : {opponent?.effects && opponent.effects.length > 0 ? opponent.effects.join(", ") : "Aucun"}</p>
                </div>
            </div>
        
            {/* --- CONTENU PRINCIPAL --- */}
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

                    {/* Affichage des effets de l'adversaire */}
                    <EffectDisplay 
                        title="Effets Subis"
                        effects={opponent?.effects}
                        isSelf={false}
                    />
                    
                    {/* Main adversaire */}
                    <Deck count={opponent?.hand?.length ?? 0} opponent={true} />

                    {/* Deck Adversaire */} 
                    <div style={{ position: 'absolute', left: '300px', top: '20px', width: '120px', height: `${180 + opponentDeckSize * 4}px`}}>
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
                            />
                            {/* Indicateur d'équipement */}
                            <EquipmentBadge equipment={card.equipment} />
                        </div>
                        ))
                    ) : (
                        <p className="text-sm text-gray-400">Aucune carte sur le board ennemi</p>
                    )}
                    </div>
                </div>
            
                {/* Zone joueur */}
                <div className="w-full flex flex-col items-center">
                    <h2 className="text-lg font-mono text-yellow-400 mb-2">Vous</h2>
                    
                    {/* Affichage de vos effets actifs */}
                    <EffectDisplay 
                        title="Vos Effets Actifs"
                        effects={me?.effects}
                        isSelf={true}
                    />

                    <div className="flex gap-2 mb-4">
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
                            overrides={{
                                cost: card.cost,
                                pv_durability: card.pv_durability,
                            }}
                            // On active le clic si c'est notre tour (la gestion fine attaque/talent est faite dans CardPVP)
                            clickable={yourTurn && selectionMode === 'none'}
                            // Appel de la demande d'attaque
                            onAttackClick={(attackName) => handleRequestAttack(i, attackName)}
                            onTalentClick={() => handleUseTalent(card.uuid)}
                        />
                        {/* Indicateur d'équipement */}
                        <EquipmentBadge equipment={card.equipment} />
                        </div>
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
                            {yourTurn && selectionMode === 'none' && (
                                <button
                                className="bg-blue-600 text-white text-xs px-1 rounded"
                                onClick={() => playCard(i)}
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

            {/* --- MODALE DE SÉLECTION D'ÉQUIPEMENT --- */}
            {equipmentModal && equipmentModal.show && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border-2 border-yellow-500 p-6 rounded-lg text-center max-w-2xl w-full">
                        <h3 className="text-2xl text-yellow-400 font-bold mb-4">
                            Équiper {equipmentModal.cardName}
                        </h3>
                        <p className="text-white mb-6">Sélectionnez un monstre à équiper :</p>
                        
                        <div className="flex flex-wrap justify-center gap-4 mb-6">
                            {equipmentModal.targets.map((mob: any) => (
                                <div 
                                    key={mob.boardIndex}
                                    onClick={() => handleSelectEquipmentTarget(mob.boardIndex)}
                                    className="cursor-pointer hover:scale-105 transition-transform border border-gray-500 rounded p-2 bg-black/50 hover:border-yellow-400"
                                >
                                    <CardPVP 
                                        card={mob} 
                                        overrides={{ cost: mob.cost, pv_durability: mob.pv_durability }}
                                        clickable={false} 
                                    />
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={handleCancelEquipment}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-bold"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
