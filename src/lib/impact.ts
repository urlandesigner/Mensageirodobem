import type { ImpactStats, ImpactViewModel } from "@/types/impact";

function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function buildImpactViewModel(stats: ImpactStats): ImpactViewModel {
  const safeMeta = stats.meta > 0 ? stats.meta : 50;
  const progresso = ((stats.totalArrecadado % safeMeta) + safeMeta) % safeMeta;
  const progressPercentage = clamp((progresso / safeMeta) * 100, 0, 100);
  const restante = progresso === 0 ? safeMeta : safeMeta - progresso;
  const metaLabel = Number.isInteger(safeMeta)
    ? `R$${safeMeta}`
    : formatCurrencyBRL(safeMeta);
  const contributionLabel = formatCurrencyBRL(1);
  const restanteLabel = formatCurrencyBRL(restante);
  return {
    title: "💛 Pequenos valores, impacto real",
    highlightedAmount: `${formatCurrencyBRL(stats.totalArrecadado)} arrecadados`,
    amountComplement: "",
    progressHint: `Faltam ${restanteLabel} para a próxima ajuda.`,
    regraDoacaoLabel: `Quando o total atinge ${metaLabel}, realizamos uma ação de ajuda.`,
    belongingLine: "Você está aqui desde o começo",
    ctaLine: `Com ${contributionLabel}, você contribui — e recebe sua mensagem.`,
    progressPercentage,
    primeiraDoacaoRealizada: stats.primeiraDoacaoRealizada,
    primeiraDoacaoLabel: "💛 A primeira ajuda ja aconteceu",
  };
}
