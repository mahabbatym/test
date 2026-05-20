import { io, type Socket } from "socket.io-client";

import { clientEnv } from "@/config/env";

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  if (!clientEnv.NEXT_PUBLIC_SOCKET_URL) {
    return null;
  }

  if (!socket) {
    socket = io(clientEnv.NEXT_PUBLIC_SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
