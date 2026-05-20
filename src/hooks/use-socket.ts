"use client";

import { useEffect, useState } from "react";
import type { Socket } from "socket.io-client";

import { disconnectSocket, getSocket } from "@/lib/socket/client";

export function useSocket(connect = false) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const instance = getSocket();
    setSocket(instance);

    if (instance && connect) {
      instance.connect();
    }

    return () => {
      disconnectSocket();
    };
  }, [connect]);

  return socket;
}
