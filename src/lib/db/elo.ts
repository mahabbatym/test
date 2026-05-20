export type EloScore = 0 | 0.5 | 1;

const DEFAULT_K = 32;

export function expectedScore(playerRating: number, opponentRating: number): number {
  return 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
}

export function calculateEloChange(
  playerRating: number,
  opponentRating: number,
  score: EloScore,
  k = DEFAULT_K,
): number {
  const expected = expectedScore(playerRating, opponentRating);
  return Math.round(k * (score - expected));
}

export function applyEloChange(rating: number, delta: number): number {
  return Math.max(100, rating + delta);
}

export type EloUpdateResult = {
  previousRating: number;
  newRating: number;
  delta: number;
};

export function computeEloUpdate(
  playerRating: number,
  opponentRating: number,
  score: EloScore,
): EloUpdateResult {
  const delta = calculateEloChange(playerRating, opponentRating, score);
  return {
    previousRating: playerRating,
    newRating: applyEloChange(playerRating, delta),
    delta,
  };
}
