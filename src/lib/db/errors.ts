export type DbResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export function dbOk<T>(data: T): DbResult<T> {
  return { ok: true, data };
}

export function dbErr(error: unknown, fallback = "Database error"): DbResult<never> {
  if (error instanceof Error) return { ok: false, error: error.message };
  if (typeof error === "object" && error !== null && "message" in error) {
    return { ok: false, error: String((error as { message: unknown }).message) };
  }
  return { ok: false, error: fallback };
}
