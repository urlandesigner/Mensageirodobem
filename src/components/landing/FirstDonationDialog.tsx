"use client";

import { useEffect, useState } from "react";

type FirstDonationDialogProps = {
  show: boolean;
};

export function FirstDonationDialog({ show }: FirstDonationDialogProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (show) setOpen(true);
  }, [show]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(33,28,23,0.35)] p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="first-donation-title"
    >
      <div className="w-full max-w-md rounded-3xl border border-[var(--stroke)] bg-[var(--paper)] p-6 shadow-[0_24px_60px_-25px_rgba(64,46,35,0.45)] sm:p-7">
        <h3
          id="first-donation-title"
          className="font-serif text-[1.45rem] font-semibold leading-tight tracking-[-0.015em] text-[var(--ink)]"
        >
          🎉 A primeira ajuda aconteceu
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)] sm:text-[0.95rem]">
          Pequenos gestos ja comecaram a se transformar em algo real. Obrigado por
          fazer parte disso.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Essa e so a primeira de muitas 🙏
        </p>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--accent)] px-5 py-2.5 font-sans text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-mid)]"
          >
            Continuar
          </button>
          <a
            href="/receber"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--stroke-strong)] bg-[var(--paper-warm)] px-5 py-2.5 font-sans text-sm font-semibold text-[var(--ink)] transition hover:border-[var(--accent)]/35 hover:bg-[var(--accent-soft)]"
          >
            Receber outra mensagem
          </a>
        </div>
      </div>
    </div>
  );
}
