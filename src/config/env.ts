import { z } from "zod";

import { isSupabaseConfigured } from "@/lib/supabase/env";

export { isSupabaseConfigured };

const emptyToUndefined = (value: string | undefined) =>
  value === "" || value === undefined ? undefined : value;

const optionalUrl = z
  .string()
  .optional()
  .transform(emptyToUndefined)
  .pipe(z.string().url().optional());

const clientEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z
    .string()
    .default("")
    .transform(emptyToUndefined)
    .pipe(z.string().url()),
  NEXT_PUBLIC_SOCKET_URL: optionalUrl,
});

function parseEnv<T extends z.ZodTypeAny>(
  schema: T,
  values: Record<string, string | undefined>,
): z.infer<T> {
  const result = schema.safeParse(values);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.flatten());
    throw new Error("Invalid environment variables");
  }
  return result.data;
}

export const clientEnv = parseEnv(clientEnvSchema, {
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
});
