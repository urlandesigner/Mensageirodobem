import type { LandingStep, MessageTeaser } from "@/types/landing";

export const LANDING_HERO = {
  eyebrow: "Mensageiro do Bem",
  title: "Há uma mensagem guardada para um momento como o seu.",
  subtitle: "Um toque para ver o que está guardado para você.",
  ctaLabel: "Abrir minha mensagem agora",
  /** Linha logo abaixo do botão principal do hero. */
  supportLine:
    "💛 Pode ser a frase que seu dia pediu em silêncio — e você nem sabia.",
} as const;

/** Opcional: reforço leve de propósito no hero (deixe vazio para ocultar). */
export const LANDING_HERO_PURPOSE_HINT =
  "Com um gesto, você recebe sua mensagem e ainda apoia ajuda real para quem precisa.";

/** Texto abaixo dos CTAs principais da landing. */
export const LANDING_CTA_HINT = "Leva poucos segundos." as const;

export const LANDING_STEPS: LandingStep[] = [
  {
    title: "Você pede",
    body: "Um toque. Sem cadastro, sem complicação. Só a vontade de receber algo bom.",
  },
  {
    title: "Confirma",
    body: "Um valor simbólico. Rápido, como mandar um gesto de carinho.",
  },
  {
    title: "Sua mensagem chega",
    body: "Na hora, na tela. Para ler com calma, guardar — ou compartilhar com alguém.",
  },
];

export const LANDING_STEPS_TITLE = "Como funciona";
export const LANDING_STEPS_INTRO =
  "Simples assim — feito para caber no seu momento.";

export const MESSAGE_TEASERS: MessageTeaser[] = [
  { text: "Respira. Você já atravessou dias difíceis antes — e ainda está aqui." },
  { text: "Não precisa ter tudo resolvido hoje. Só permitir-se começar de onde você está." },
  { text: "Lembre-se: gentileza também é escolher ser paciente com você mesmo." },
];

export const MESSAGE_TEASERS_TITLE = "O tipo de carinho que pode chegar até você";
export const MESSAGE_TEASERS_NOTE =
  "São apenas exemplos. A sua mensagem será uma surpresa — escolhida com cuidado para emocionar.";

export const FINAL_CTA = {
  title: "Se o coração puxou um pouquinho…",
  body: "Talvez seja o momento de se permitir isso. Às vezes, uma mensagem muda mais do que a gente imagina.",
  ctaLabel: "Abrir minha mensagem agora",
} as const;

export const TRANSPARENCY_FOOTER_NOTE =
  "Parte dos valores arrecadados é destinada a ações de ajuda real." as const;

export const TRANSPARENCY_LINK_LABEL = "Como isso funciona" as const;

export const TRANSPARENCY_MODAL = {
  title: "Como isso funciona",
  body: "O Mensageiro do Bem tem custos para continuar existindo e chegando com cuidado até você.",
  helpLine: "Uma parte dos valores é destinada a gerar ajuda real para alguém.",
  continuityLine: "Assim, o projeto segue vivo e o impacto pode continuar acontecendo.",
  closeLabel: "Entendi",
} as const;
