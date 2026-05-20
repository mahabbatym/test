"use server";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Client = SupabaseClient<Database, "public", any>;

export type SubmitFeedbackState = {
  ok: boolean;
  message: string;
};

export async function submitFeedbackAction(
  _state: SubmitFeedbackState,
  formData: FormData,
): Promise<SubmitFeedbackState> {
  const type = formData.get("type");
  const message = String(formData.get("message") ?? "").trim();
  const path = String(formData.get("path") ?? "").trim() || null;

  if ((type !== "bug" && type !== "suggestion") || message.length < 8) {
    return { ok: false, message: "Please describe the report in more detail." };
  }

  try {
    const supabase = (await createClient()) as Client;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("feedback").insert({
      type,
      message,
      path,
      user_id: user?.id ?? null,
    });

    if (error) throw error;
    return { ok: true, message: "Feedback saved. Thank you." };
  } catch (error) {
    console.error("Cherry feedback fallback log", {
      type,
      message,
      path,
      error,
    });
    return { ok: true, message: "Feedback logged locally for support review." };
  }
}
