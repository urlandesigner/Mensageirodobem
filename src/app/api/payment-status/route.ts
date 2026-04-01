import { NextResponse } from "next/server";
import { fetchPaymentStatus, requireAsaasApiKeyOrMessage } from "@/lib/asaas";

/** Status Asaas considerados “pago” para liberar a mensagem. */
const PAID_STATUSES = new Set(["RECEIVED", "CONFIRMED"]);

export async function GET(request: Request) {
  const missing = requireAsaasApiKeyOrMessage();
  if (missing) {
    return NextResponse.json({ error: missing }, { status: 503 });
  }

  const id = new URL(request.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json(
      { error: "Informe o id da cobrança (parâmetro id)." },
      { status: 400 },
    );
  }

  try {
    const status = await fetchPaymentStatus(id);
    const paid = PAID_STATUSES.has(status);

    return NextResponse.json({ status, paid });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao consultar";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
