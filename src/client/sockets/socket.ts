import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3002", {
      transports: ["websocket"],
      autoConnect: true,
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
