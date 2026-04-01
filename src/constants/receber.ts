/** Texto de expectativa no topo da página /receber. */
export const RECEBER_EXPECTATION = {
  title: "Sua mensagem está te esperando…",
  subtitle: "Só falta um gesto seu.",
  quickHint: "Leva menos de 10 segundos.",
  microcopy: "Sem cadastro. Sem complicação.",
} as const;

/** Transparência: nome exibido no app do banco como recebedor do PIX. */
export const RECEBER_PAYMENT_RECIPIENT_HINT =
  "Você está enviando para Urlan Dipré, criador do projeto." as const;

/** Soft launch: apenas R$1 (Mercado Pago). Outros valores voltam quando Asaas estiver em produção. */
export const PAYMENT_AMOUNT_OPTIONS = [
  {
    value: 1,
    label: "R$1",
    meaning: "Receba uma mensagem",
    recommended: false,
  },
] as const;

/** Se existir valor diferente de R$1, o fluxo Asaas (cliente + cobrança) é necessário. */
export const REQUIRES_ASAAS_FOR_PAYMENTS = PAYMENT_AMOUNT_OPTIONS.some(
  (o) => o.value !== 1,
);

export const DEFAULT_PAYMENT_AMOUNT = 1 as const;

/** Placeholder alinhado ao MVP (R$1); reservado se voltar fluxo de simulação. */
export const PIX_SIMULATION = {
  amount: "R$ 1,00",
  recipient: "Mensageiro do Bem",
  pixKey: "mensageiro.do.bem@pix.simulado",
  instructions: [
    "Abra o app do seu banco e escolha pagar com PIX.",
    "Use a chave abaixo ou escaneie o QR ilustrativo (simulação).",
    "Quando concluir no banco, toque em “Abrir minha mensagem” para ver sua surpresa.",
  ],
} as const;
