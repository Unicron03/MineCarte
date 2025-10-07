

type ConfettiEvent = {
    type: "SPAWN_CONFETTI";
};

class ConfettiController {
    private listeners: ((event: ConfettiEvent) => void)[] = [];
    
    on(listener: (event: ConfettiEvent) => void) {
        this.listeners.push(listener);
    }
    
    off(listener: (event: ConfettiEvent) => void) {
        this.listeners = this.listeners.filter((l) => l !== listener);
    }
    
    spawnWave() {
        this.listeners.forEach((l) => l({ type: "SPAWN_CONFETTI" }));
    }
}

export const confettiController = new ConfettiController();