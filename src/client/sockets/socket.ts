import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    // En production, utilise le même domaine avec le bon protocole
    // En dev local, utilise localhost:3002
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL ?? 
      (typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? "" // URL relative - utilise le même domaine
        : "http://localhost:3002");
    
    socket = io(socketUrl, {
      transports: ["websocket", "polling"], // polling en fallback
      autoConnect: true,
      path: "/socket.io/", // Path par défaut
    });
  }
  return socket;
}

export function closeSocket(): void {
  if (socket) {
    try {
      socket.disconnect();
    } catch (e) {
      console.warn("closeSocket error", e);
    }
    socket = null;
  }
}

