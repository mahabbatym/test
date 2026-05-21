export const BOARD_SKIN_CONFIG = {
  walnut: {
    labelKey: "store_board_walnut" as const,
    swatches: ["#f4e4cf", "#a96d47"] as const,
    colors: {
      light: "#f4e4cf",
      dark: "#a96d47",
      lastMove: "#f4b7b7",
    },
  },
  obsidian: {
    labelKey: "store_board_obsidian" as const,
    swatches: ["#3d4a62", "#101523"] as const,
    colors: {
      light: "#3d4a62",
      dark: "#101523",
      lastMove: "#1f2937",
    },
  },
  crimson: {
    labelKey: "store_board_crimson" as const,
    swatches: ["#ffe1e1", "#b91c1c"] as const,
    colors: {
      light: "#ffe1e1",
      dark: "#b91c1c",
      lastMove: "#fca5a5",
    },
  },
} as const;

export type BoardSkinId = keyof typeof BOARD_SKIN_CONFIG;

export const DEFAULT_BOARD_SKIN: BoardSkinId = "walnut";

export const PIECE_SKIN_CONFIG = {
  "Minimalist Vector": {
    labelKey: "store_piece_minimal" as const,
    dataAttr: "minimal" as const,
    filter:
      "drop-shadow(0 10px 9px rgb(0 0 0 / 0.18))",
  },
  "Heavy Metal Metallic": {
    labelKey: "store_piece_metal" as const,
    dataAttr: "metal" as const,
    filter:
      "grayscale(0.05) contrast(1.35) drop-shadow(0 12px 12px rgb(0 0 0 / 0.3))",
  },
  "3D Retro": {
    labelKey: "store_piece_retro" as const,
    dataAttr: "retro" as const,
    filter:
      "saturate(1.45) drop-shadow(0 12px 12px rgb(124 45 18 / 0.35))",
  },
  "Geometric Anime": {
    labelKey: "store_piece_geometric" as const,
    dataAttr: "geometric" as const,
    filter:
      "hue-rotate(12deg) saturate(1.6) drop-shadow(0 12px 12px rgb(79 70 229 / 0.28))",
  },
} as const;

export type PieceSkinId = keyof typeof PIECE_SKIN_CONFIG;

export const DEFAULT_PIECE_SKIN: PieceSkinId = "Minimalist Vector";

export type VisualThemeDetail = {
  boardSkin: BoardSkinId;
  pieceSkin: PieceSkinId;
};

export const VISUAL_THEME_EVENT = "cherry-visual-theme";

export function isBoardSkinId(value: string | null | undefined): value is BoardSkinId {
  return value !== null && value !== undefined && value in BOARD_SKIN_CONFIG;
}

export function isPieceSkinId(value: string | null | undefined): value is PieceSkinId {
  return value !== null && value !== undefined && value in PIECE_SKIN_CONFIG;
}

export function applyThemeToDocument(theme: VisualThemeDetail) {
  if (typeof document === "undefined") return;

  const board = BOARD_SKIN_CONFIG[theme.boardSkin];
  const piece = PIECE_SKIN_CONFIG[theme.pieceSkin];
  const root = document.documentElement;

  root.style.setProperty("--board-light", board.colors.light);
  root.style.setProperty("--board-dark", board.colors.dark);
  root.style.setProperty("--board-last-move", board.colors.lastMove);
  root.style.setProperty("--cherry-piece-filter", piece.filter);
  root.dataset.pieceSkin = piece.dataAttr;
  root.dataset.boardSkin = theme.boardSkin;
}
