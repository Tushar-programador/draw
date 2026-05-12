import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/**
 * Returns a lazily-initialised Socket.io singleton.
 * The JWT token is sent as a query param so the server can authenticate
 * the WebSocket connection before upgrading.
 */
export function getSocket(token: string): Socket {
  if (!socket || !socket.connected) {
    socket = io("/", {
      auth: { token },
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  socket?.disconnect();
  socket = null;
}
