"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DEFAULT_PAYMENT_AMOUNT,
  RECEBER_EXPECTATION,
} from "@/constants/receber";
import { pickRandomMessage } from "@/lib/messages";
import {
  clearPaymentSession,
  readPaymentSession,
  writePaymentSession,
} from "@/lib/payment-session";
import { AmountSelector } from "./AmountSelector";

const ASAAS_CUSTOMER_STORAGE_KEY = "mdb_asaas_customer_id";

type AsaasApiErrorFields = {
  error?: string;
  asaasHttpStatus?: number;
  asaasResponseBody?: string;
  asaasRequestUrl?: string;
};

type CreateCustomerResponse = {
  id: string;
  reused?: boolean;
} & AsaasApiErrorFields;

type CreatePaymentResponse = {
  paymentId: string;
  qrImageSrc: string;
  payload: string;
} & AsaasApiErrorFields;

type MercadoPagoCreatePixResponse = {
  paymentId?: string;
  amount?: number;
  qrCode?: string;
  qrCodeBase64?: string;
  status?: string;
  payload?: string;
} & AsaasApiErrorFields;

type AsaasCreatePixResponse = {
  id?: string;
  qrCode?: string;
  copiaECola?: string;
  payload?: string;
} & AsaasApiErrorFields;

function describeAsaasApiFailure(
  data: AsaasApiErrorFields,
  fallback: string,
): string {
  let s = data.error ?? fallback;
  if (data.asaasRequestUrl) {
    s += `\n\nURL: ${data.asaasRequestUrl}`;
  }
  if (
    data.asaasHttpStatus != null &&
    data.asaasHttpStatus !== 0
  ) {
    s += `\nHTTP: ${data.asaasHttpStatus}`;
  }
  if (data.asaasResponseBody) {
    s += `\n\nCorpo da resposta Asaas:\n${data.asaasResponseBody}`;
  }
  return s;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function stepsForAmount(): readonly string[] {
  return [
    "Abra o PIX do seu banco.",
    "Use o QR Code ou copie o codigo.",
    "Depois, confirme aqui para abrir sua mensagem.",
  ] as const;
}

function normalizePaymentResponse(
  provider: "mercado-pago" | "asaas",
  data: MercadoPagoCreatePixResponse | AsaasCreatePixResponse,
): CreatePaymentResponse {
  if (provider === "mercado-pago") {
    const mp = data as MercadoPagoCreatePixResponse;
    const paymentId = typeof mp.paymentId === "string" ? mp.paymentId : "";
    const payload =
      typeof mp.qrCode === "string" && mp.qrCode.trim().length > 0
        ? mp.qrCode
        : typeof mp.payload === "string"
          ? mp.payload
          : "";
    const qrCodeBase64 =
      typeof mp.qrCodeBase64 === "string" ? mp.qrCodeBase64 : "";
    if (!paymentId || !payload || !qrCodeBase64) {
      throw new Error(
        "💛 Tivemos um pequeno problema ao preparar seu pagamento. Tente novamente.",
      );
    }
    return {
      paymentId,
      payload,
      qrImageSrc: `data:image/jpeg;base64,${qrCodeBase64}`,
    };
  }

  const asaas = data as AsaasCreatePixResponse;
  const paymentId = typeof asaas.id === "string" ? asaas.id : "";
  const qrImageSrc = typeof asaas.qrCode === "string" ? asaas.qrCode : "";
  const payload =
    typeof asaas.copiaECola === "string" && asaas.copiaECola.trim().length > 0
      ? asaas.copiaECola
      : typeof asaas.payload === "string"
        ? asaas.payload
        : "";
  if (!paymentId || !payload || !qrImageSrc) {
    throw new Error("Resposta incompleta do Asaas.");
  }
  return {
    paymentId,
    payload,
    qrImageSrc,
  };
}

function PaymentStatusCard({
  title,
  description,
  hint,
  tone = "neutral",
}: {
  title: string;
  description: string;
  hint?: string;
  tone?: "neutral" | "warning" | "error";
}) {
  const toneClasses =
    tone === "error"
      ? "border-[var(--accent)]/30 bg-[var(--accent-soft)]"
      : tone === "warning"
        ? "border-[var(--stroke-strong)] bg-[var(--paper-warm)]"
        : "border-[var(--stroke)] bg-[var(--paper)]";

  return (
    <section
      className={`animate-fade-up mt-4 w-full max-w-sm rounded-2xl border px-4 py-4 text-left shadow-sm ${toneClasses}`}
      role="status"
      aria-live="polite"
    >
      <h3 className="font-sans text-sm font-semibold text-[var(--ink)]">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--muted)]">
        {description}
      </p>
      {hint ? (
        <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]/90">{hint}</p>
      ) : null}
    </section>
  );
}

export function ReceberView() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [payment, setPayment] = useState<CreatePaymentResponse | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number>(
    DEFAULT_PAYMENT_AMOUNT,
  );
  const [creatingPayment, setCreatingPayment] = useState(false);
  const [checking, setChecking] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  /** Cobrança ainda não confirmada pelo Asaas — mostra copy amigável em vez de “Status: PENDING”. */
  const [awaitingPaymentConfirm, setAwaitingPaymentConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    setPayment(null);
    clearPaymentSession();

    (async () => {
      const readStored = () =>
        typeof window !== "undefined"
          ? window.localStorage.getItem(ASAAS_CUSTOMER_STORAGE_KEY)?.trim() ||
            null
          : null;

      const createCustomer = async (): Promise<string> => {
        const cRes = await fetch("/api/create-customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
        const cData = (await cRes.json()) as CreateCustomerResponse;
        if (!cRes.ok) {
          throw new Error(
            describeAsaasApiFailure(
              cData,
              "Não foi possível garantir o cliente.",
            ),
          );
        }
        if (!cData.id) {
          throw new Error("Resposta incompleta (cliente).");
        }
        try {
          window.localStorage.setItem(ASAAS_CUSTOMER_STORAGE_KEY, cData.id);
        } catch {
          /* ignore quota / private mode */
        }
        return cData.id;
      };

      try {
        let resolvedCustomerId = readStored();
        if (!resolvedCustomerId) {
          resolvedCustomerId = await createCustomer();
        }
        if (!cancelled) setCustomerId(resolvedCustomerId);
      } catch (e) {
        if (!cancelled) {
          const msg =
            e instanceof Error
              ? e.message
              : "Nao foi possivel preparar seu pagamento agora. Tente novamente em instantes.";
          setLoadError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const createPaymentForSelectedAmount = useCallback(async () => {
    if (creatingPayment) return;
    const provider = selectedAmount === 1 ? "mercado-pago" : "asaas";
    if (provider === "asaas" && !customerId) return;

    setCreatingPayment(true);
    setLoadError(null);
    setPayment(null);
    setPayError(null);
    setAwaitingPaymentConfirm(false);
    try {
      const req =
        provider === "mercado-pago"
          ? {
              url: "/api/create-pix",
              body: { value: selectedAmount },
            }
          : {
              url: "/api/create-payment",
              body: { customerId, amount: selectedAmount },
            };

      const res = await fetch(req.url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body),
      });
      const data = (await res.json()) as
        | (MercadoPagoCreatePixResponse & { error?: string })
        | (AsaasCreatePixResponse & { error?: string });
      if (!res.ok) {
        throw new Error(
          describeAsaasApiFailure(data, "Nao foi possivel criar o pagamento."),
        );
      }
      const normalized = normalizePaymentResponse(provider, data);
      writePaymentSession({
        paymentId: normalized.paymentId,
        paymentStatus: "pending",
        createdAt: new Date().toISOString(),
        amount: selectedAmount,
      });
      setPayment(normalized);
    } catch (e) {
      const rawMsg = e instanceof Error ? e.message : "Erro ao criar pagamento.";
      const msg =
        rawMsg.includes("Mercado Pago") || rawMsg.includes("preparar seu pagamento")
          ? "💛 Tivemos um pequeno problema ao preparar seu pagamento. Tente novamente."
          : rawMsg;
      setLoadError(msg);
    } finally {
      setCreatingPayment(false);
    }
  }, [creatingPayment, customerId, selectedAmount]);

  const handleCopy = useCallback(async () => {
    if (!payment?.payload) return;
    try {
      await navigator.clipboard.writeText(payment.payload);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }, [payment?.payload]);

  const handlePaid = async () => {
    const paymentId =
      payment?.paymentId?.trim() ||
      (typeof window !== "undefined"
        ? readPaymentSession()?.paymentId?.trim() ?? ""
        : "");
    if (!paymentId) return;
    setChecking(true);
    setPayError(null);
    setAwaitingPaymentConfirm(false);
    try {
      const res = await fetch(
        `/api/payment-status?id=${encodeURIComponent(paymentId)}`,
      );
      const data = (await res.json()) as {
        paid?: boolean;
        status?: string;
        error?: string;
      };
      if (!res.ok) {
        setAwaitingPaymentConfirm(false);
        setPayError(
          data.error ??
            (res.status === 503
              ? "Ainda nao conseguimos confirmar por aqui. Tente mais uma vez em instantes."
              : "Nao conseguimos confirmar o pagamento agora. Tente novamente."),
        );
        return;
      }
      if (data.paid) {
        setAwaitingPaymentConfirm(false);
        const message = pickRandomMessage();
        const prev = readPaymentSession();
        const createdAt =
          prev?.paymentId === paymentId && prev.createdAt
            ? prev.createdAt
            : new Date().toISOString();
        writePaymentSession({
          paymentId,
          paymentStatus: "confirmed",
          createdAt,
          amount: prev?.amount,
          messageId: message.id,
        });
        router.push(`/mensagem?id=${encodeURIComponent(message.id)}`);
        return;
      }
      setAwaitingPaymentConfirm(true);
    } catch {
      setAwaitingPaymentConfirm(false);
      setPayError("Falha de rede ao consultar o status.");
    } finally {
      setChecking(false);
    }
  };

  const retryLoad = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-full px-5 pb-16 pt-10 sm:px-8 sm:pb-20 sm:pt-14">
      <div className="mx-auto max-w-xl">
        <Link
          href="/"
          className="inline-flex text-sm font-medium text-[var(--muted)] underline-offset-4 transition hover:text-[var(--accent-mid)] hover:underline"
        >
          ← Voltar ao início
        </Link>

        <header className="mt-8 text-center animate-fade-up opacity-0 [animation-delay:80ms] [animation-fill-mode:forwards]">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
            {loading ? "Preparando seu momento..." : "Quase la"}
          </p>
          <h1 className="mt-3 font-serif text-[1.75rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--ink)] sm:text-[2rem]">
            {RECEBER_EXPECTATION.title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base leading-relaxed text-[var(--ink)]/90 sm:text-lg">
            {RECEBER_EXPECTATION.subtitle}
          </p>
          <p className="mt-3 text-center text-xs font-medium text-[var(--muted)] sm:text-[0.8125rem]">
            {RECEBER_EXPECTATION.quickHint}
          </p>
        </header>

        <AmountSelector
          value={selectedAmount}
          onChange={(next) => {
            setSelectedAmount(next);
            setPayment(null);
            setPayError(null);
            setAwaitingPaymentConfirm(false);
          }}
        />

        <div className="mt-6 flex flex-col items-center gap-3">
          <p className="text-center text-sm leading-relaxed text-[var(--muted)]">
            💛 Esse pequeno gesto ja comeca a fazer diferenca
          </p>
          <button
            type="button"
            disabled={
              loading ||
              creatingPayment ||
              (selectedAmount !== 1 && !customerId)
            }
            onClick={createPaymentForSelectedAmount}
            className="inline-flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full bg-[#C9785C] px-8 py-3.5 text-center text-[0.9375rem] font-semibold tracking-wide text-white shadow-[0_4px_24px_-6px_rgba(201,120,92,0.55),0_1px_0_0_rgba(255,255,255,0.2)_inset] transition duration-200 hover:!brightness-[1.06] hover:shadow-[0_6px_28px_-6px_rgba(201,120,92,0.5)] disabled:cursor-not-allowed disabled:opacity-55"
          >
            {creatingPayment ? "💛 Preparando seu pagamento..." : "💛 Continuar"}
          </button>
          <p className="text-center text-xs text-[var(--muted)]">
            Troque o valor quando quiser, sem complicacao.
          </p>
        </div>

        <ol className="animate-fade-up mt-10 space-y-3 rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--paper)] px-5 py-6 opacity-0 shadow-[var(--shadow-ticket)] [animation-delay:140ms] [animation-fill-mode:forwards] sm:px-6">
          <li className="text-sm font-semibold leading-relaxed text-[var(--ink)] sm:text-[0.9375rem]">
            💛 Como enviar
          </li>
          {stepsForAmount().map((line, i) => (
            <li
              key={i}
              className="flex gap-3 text-sm leading-relaxed text-[var(--ink)] sm:text-[0.9375rem]"
            >
              <span
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent-mid)]"
                aria-hidden
              >
                {i + 1}
              </span>
              <span className="pt-0.5">{line}</span>
            </li>
          ))}
        </ol>

        {loadError && (
          <div
            className="mt-8 rounded-2xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] px-5 py-4 text-center text-sm text-[var(--ink)]"
            role="alert"
          >
            <p className="whitespace-pre-wrap break-words text-left">
              {loadError}
            </p>
            <button
              type="button"
              onClick={retryLoad}
              className="mt-3 text-sm font-semibold text-[var(--accent-mid)] underline-offset-2 hover:underline"
            >
              Recarregar página
            </button>
          </div>
        )}

        {payment && !loadError && (
          <>
            <p className="mt-7 text-center text-sm font-medium text-[var(--ink)]/85">
              💛 Voce escolheu contribuir com {formatCurrency(selectedAmount)}
            </p>
            <section
              className="mt-8 rounded-2xl border border-[var(--paper-edge)] bg-[var(--paper-warm)]/90 px-5 py-6 shadow-[var(--shadow-ticket)] sm:px-6 sm:py-7"
              aria-labelledby="valor-heading"
            >
              <h2
                id="valor-heading"
                className="text-center font-sans text-xs font-semibold uppercase tracking-[0.2em] text-[var(--muted)]"
              >
                Seu gesto
              </h2>
              <p className="mt-2 text-center font-serif text-3xl font-semibold text-[var(--accent-mid)]">
                {formatCurrency(selectedAmount)}
              </p>
              <p className="mt-1 text-center text-xs text-[var(--muted)]">
                Leva poucos segundos. Sem cadastro.
              </p>

              <div className="mt-6 border-t border-[var(--stroke)] pt-6">
                <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                  Codigo PIX Copia e Cola
                </p>
                <p className="mt-3 break-all rounded-xl border border-[var(--stroke)] bg-white/90 px-4 py-3 text-left font-mono text-[0.7rem] leading-relaxed text-[var(--ink)] sm:text-[0.75rem]">
                  {payment.payload || "Codigo indisponivel no momento."}
                </p>
                <div className="mt-4 flex justify-center">
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded-full border border-[var(--stroke-strong)] bg-[var(--paper)] px-6 py-2.5 text-sm font-semibold text-[var(--accent-mid)] shadow-sm transition hover:bg-[var(--accent-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]/35"
                  >
                    {copied ? "Copiado!" : "Copiar código"}
                  </button>
                </div>
              </div>
            </section>

            <section
              className="mt-7 rounded-2xl border border-dashed border-[var(--stroke-strong)] bg-[var(--paper)] px-5 py-8 shadow-[var(--shadow-ticket)] sm:mt-8 sm:px-6"
              aria-labelledby="qr-heading"
            >
              <h2
                id="qr-heading"
                className="text-center font-serif text-lg font-semibold text-[var(--ink)]"
              >
                QR Code
              </h2>
              <p className="mx-auto mt-2 max-w-sm text-center text-sm text-[var(--muted)]">
                Escaneie com o app do seu banco e finalize quando quiser.
              </p>
              <div className="mt-8 flex min-h-[200px] items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL da API / qrcode */}
                <img
                  src={payment.qrImageSrc}
                  alt="QR Code PIX"
                  className="max-w-[240px] rounded-xl border border-[var(--paper-edge)] bg-white p-2 shadow-[var(--shadow-ticket)]"
                />
              </div>
            </section>
          </>
        )}

        <div className="mt-10 flex flex-col items-center gap-3.5">
          <button
            type="button"
            disabled={loading || creatingPayment || !payment?.paymentId || checking}
            onClick={handlePaid}
            className="inline-flex min-h-[3.25rem] w-full max-w-sm items-center justify-center rounded-full px-8 py-3.5 text-center text-[0.9375rem] font-semibold tracking-wide text-white shadow-[0_4px_24px_-6px_rgba(201,120,92,0.55),0_1px_0_0_rgba(255,255,255,0.2)_inset] transition duration-200 hover:!brightness-[1.06] hover:shadow-[0_6px_28px_-6px_rgba(201,120,92,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9785C] enabled:cursor-pointer enabled:bg-[#C9785C] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:min-w-[18rem]"
          >
            {checking ? "💛 Conferindo..." : "💛 Ja enviei"}
          </button>
          <p className="text-center text-xs font-medium text-[var(--muted)]">
            Leva poucos segundos • Sem cadastro
          </p>
          {checking ? (
            <PaymentStatusCard
              title="💛 Estamos conferindo seu envio"
              description="A confirmacao pode levar alguns segundos para aparecer por aqui."
            />
          ) : null}
          {awaitingPaymentConfirm && !checking ? (
            <PaymentStatusCard
              title="💛 Ainda nao apareceu por aqui"
              description="As vezes leva um pouco mais para atualizar."
              hint="Se ainda nao aparecer, tente novamente em instantes."
              tone="warning"
            />
          ) : null}
          {payError ? (
            <PaymentStatusCard
              title="💛 Tivemos um pequeno problema ao verificar"
              description={payError}
              hint="Tente novamente."
              tone="error"
            />
          ) : null}
          <p className="max-w-xs text-center text-xs leading-relaxed text-[var(--muted)]">
            {RECEBER_EXPECTATION.microcopy}
          </p>
        </div>
      </div>
    </div>
  );
}
