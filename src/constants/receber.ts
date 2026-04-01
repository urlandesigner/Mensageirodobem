/** Texto de expectativa no topo da página /receber. */
export const RECEBER_EXPECTATION = {
  title: "Sua mensagem está te esperando…",
  subtitle: "Só falta um gesto seu.",
  quickHint: "Leva menos de 10 segundos.",
  microcopy: "Sem cadastro. Sem complicação.",
} as const;

export const PAYMENT_AMOUNT_OPTIONS = [
  { value: 1, label: "R$1", meaning: "Um gesto simples" },
  { value: 5, label: "R$5", meaning: "Um pequeno apoio (recomendado)", recommended: true },
  { value: 10, label: "R$10", meaning: "Ja faz diferenca" },
  { value: 20, label: "R$20", meaning: "Um gesto mais generoso" },
] as const;

export const DEFAULT_PAYMENT_AMOUNT = 1 as const;

/** Valores exibidos na simulação de PIX (sem integração real). */
export const PIX_SIMULATION = {
  amount: "R$ 4,90",
  recipient: "Mensageiro do Bem",
  pixKey: "mensageiro.do.bem@pix.simulado",
  instructions: [
    "Abra o app do seu banco e escolha pagar com PIX.",
    "Use a chave abaixo ou escaneie o QR ilustrativo (simulação).",
    "Quando concluir no banco, toque em “Abrir minha mensagem” para ver sua surpresa.",
  ],
} as const;
