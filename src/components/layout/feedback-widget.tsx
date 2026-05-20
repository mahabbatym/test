"use client";

import { MessageSquare, X } from "lucide-react";
import { useActionState, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { submitFeedbackAction } from "@/features/feedback/actions";
import { useI18n } from "@/providers/i18n-provider";

const initialState = { ok: false, message: "" };

export function FeedbackWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [path, setPath] = useState("/");
  const [state, action, pending] = useActionState(
    submitFeedbackAction,
    initialState,
  );

  useEffect(() => {
    setPath(window.location.pathname);
  }, [open]);

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="w-full justify-start gap-2"
      >
        <MessageSquare className="size-4" />
        {t("feedback")}
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center">
          <form
            action={action}
            className="border-border bg-card w-full max-w-md rounded-xl border p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">
                {t("reportTitle")}
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X className="size-5" />
              </button>
            </div>

            <input type="hidden" name="path" value={path} />

            <label className="mt-5 block space-y-2">
              <span className="text-sm font-medium">{t("reportType")}</span>
              <select
                name="type"
                className="border-border bg-background text-foreground w-full rounded-lg border px-3 py-2 text-sm"
              >
                <option value="bug">{t("bug")}</option>
                <option value="suggestion">{t("suggestion")}</option>
              </select>
            </label>

            <label className="mt-4 block space-y-2">
              <span className="text-sm font-medium">{t("reportMessage")}</span>
              <textarea
                name="message"
                required
                minLength={8}
                rows={5}
                className="border-border bg-background text-foreground placeholder:text-muted w-full resize-none rounded-lg border px-3 py-2 text-sm"
                placeholder="..."
              />
            </label>

            {state.message ? (
              <p className="text-muted mt-3 text-sm">{state.message}</p>
            ) : null}

            <Button type="submit" disabled={pending} className="mt-5 w-full">
              {pending ? t("sending") : t("send")}
            </Button>
          </form>
        </div>
      ) : null}
    </>
  );
}
