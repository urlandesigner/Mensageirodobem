export type ImpactStats = {
  totalArrecadado: number;
  totalDestinado: number;
  meta: number;
  primeiraDoacaoRealizada: boolean;
};

export type ImpactViewModel = {
  title: string;
  highlightedAmount: string;
  amountComplement: string;
  progressHint: string;
  regraDoacaoLabel: string;
  belongingLine: string;
  ctaLine: string;
  progressPercentage: number;
  primeiraDoacaoRealizada: boolean;
  primeiraDoacaoLabel: string;
};
