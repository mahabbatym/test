"use client";

import { useEffect, useMemo, useRef } from "react";
import type { Square } from "chess.js";

import {
  Chessground,
} from "@/vendor/chessground/src/chessground";
import type { Api } from "@/vendor/chessground/src/api";
import type {
  Color as CgColor,
  Dests,
  Key,
  SquareClasses,
} from "@/vendor/chessground/src/types";

type ChessgroundBoardProps = {
  fen: string;
  orientation: CgColor;
  turnColor: CgColor;
  movableColor?: CgColor;
  interactive: boolean;
  legalDests: Dests;
  lastMove: [Square, Square] | null;
  check: CgColor | false;
  captureSquare: Square | null;
  onMove: (from: Square, to: Square) => boolean;
};

function toKey(square: Square): Key {
  return square as Key;
}

export function ChessgroundBoard({
  fen,
  orientation,
  turnColor,
  movableColor,
  interactive,
  legalDests,
  lastMove,
  check,
  captureSquare,
  onMove,
}: ChessgroundBoardProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const apiRef = useRef<Api | null>(null);
  const fenRef = useRef(fen);
  const onMoveRef = useRef(onMove);

  fenRef.current = fen;
  onMoveRef.current = onMove;

  const customSquareClasses = useMemo<SquareClasses | undefined>(() => {
    if (!captureSquare) return undefined;
    return new Map([[toKey(captureSquare), "cherry-capture-square"]]);
  }, [captureSquare]);

  useEffect(() => {
    if (!hostRef.current || apiRef.current) return;

    apiRef.current = Chessground(hostRef.current, {
      fen,
      orientation,
      turnColor,
      coordinates: false,
      autoCastle: true,
      highlight: {
        check: true,
        lastMove: true,
        custom: customSquareClasses,
      },
      animation: {
        enabled: true,
        duration: 170,
      },
      movable: {
        free: false,
        color: interactive ? movableColor : undefined,
        dests: legalDests,
        showDests: true,
        rookCastle: true,
        events: {
          after: (orig, dest) => {
            const accepted = onMoveRef.current(orig as Square, dest as Square);
            if (!accepted) {
              apiRef.current?.set({ fen: fenRef.current });
            }
          },
        },
      },
      draggable: {
        enabled: interactive,
        showGhost: true,
      },
      selectable: {
        enabled: interactive,
      },
      premovable: {
        enabled: false,
      },
      drawable: {
        enabled: false,
        visible: false,
      },
    });

    return () => {
      apiRef.current?.destroy();
      apiRef.current = null;
    };
    // Chessground owns imperative DOM setup; reactive updates go through api.set below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiRef.current?.set({
      fen,
      orientation,
      turnColor,
      check,
      lastMove: lastMove ? [toKey(lastMove[0]), toKey(lastMove[1])] : undefined,
      highlight: {
        check: true,
        lastMove: true,
        custom: customSquareClasses,
      },
      movable: {
        free: false,
        color: interactive ? movableColor : undefined,
        dests: legalDests,
        showDests: true,
        rookCastle: true,
      },
      draggable: {
        enabled: interactive,
        showGhost: true,
      },
      selectable: {
        enabled: interactive,
      },
    });
  }, [
    check,
    customSquareClasses,
    fen,
    interactive,
    lastMove,
    legalDests,
    movableColor,
    orientation,
    turnColor,
  ]);

  return <div ref={hostRef} className="cherry-cg-board absolute inset-0" />;
}
