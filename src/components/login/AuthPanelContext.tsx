"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type AuthPanelContextType = {
    openConnectionPanel: boolean;
    openInscriptionPanel: boolean;
    setOpenConnectionPanel: (open: boolean) => void;
    setOpenInscriptionPanel: (open: boolean) => void;
    switchToInscription: () => void;
    switchToConnection: () => void;
};

const AuthPanelContext = createContext<AuthPanelContextType | undefined>(undefined);

export function AuthPanelProvider({ children }: { children: ReactNode }) {
    const [openConnectionPanel, setOpenConnectionPanel] = useState(false);
    const [openInscriptionPanel, setOpenInscriptionPanel] = useState(false);

    const switchToInscription = () => {
        setOpenConnectionPanel(false);
        setTimeout(() => setOpenInscriptionPanel(true), 100);
    };

    const switchToConnection = () => {
        setOpenInscriptionPanel(false);
        setTimeout(() => setOpenConnectionPanel(true), 100);
    };

    return (
        <AuthPanelContext.Provider
            value={{
                openConnectionPanel,
                openInscriptionPanel,
                setOpenConnectionPanel,
                setOpenInscriptionPanel,
                switchToInscription,
                switchToConnection,
            }}
        >
            {children}
        </AuthPanelContext.Provider>
    );
}

export function useAuthPanel() {
    const context = useContext(AuthPanelContext);
    if (!context) {
        throw new Error("useAuthPanel must be used within AuthPanelProvider");
    }
    return context;
}