 "use client";

import { useState } from "react";
import {
  TRANSPARENCY_FOOTER_NOTE,
  TRANSPARENCY_LINK_LABEL,
  TRANSPARENCY_MODAL,
} from "@/constants/landing";

export function LandingFooter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-[var(--stroke)] bg-[var(--paper-warm)]/30 px-5 py-10 text-center sm:px-8">
        <p className="text-[0.8125rem] leading-relaxed text-[var(--muted)]">
          Mensageiro do Bem · Mensagens com carinho, para dias de todo tipo.
        </p>
        <p className="mx-auto mt-3 max-w-xl text-xs leading-relaxed text-[var(--muted)]/90">
          {TRANSPARENCY_FOOTER_NOTE}
        </p>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-3 text-xs font-medium text-[var(--muted)] underline underline-offset-4 transition hover:text-[var(--accent-mid)]"
        >
          {TRANSPARENCY_LINK_LABEL}
        </button>
      </footer>

      {open ? (
        <div
          className="fixed inset-0 z-[220] flex items-end justify-center bg-[rgba(33,28,23,0.35)] p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="transparency-title"
        >
          <div className="w-full max-w-md rounded-3xl border border-[var(--stroke)] bg-[var(--paper)] p-6 text-left shadow-[var(--shadow-ticket)] sm:p-7">
            <h3
              id="transparency-title"
              className="font-serif text-[1.35rem] font-semibold leading-tight text-[var(--ink)]"
            >
              {TRANSPARENCY_MODAL.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
              {TRANSPARENCY_MODAL.body}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {TRANSPARENCY_MODAL.helpLine}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
              {TRANSPARENCY_MODAL.continuityLine}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-mid)]"
              >
                {TRANSPARENCY_MODAL.closeLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
