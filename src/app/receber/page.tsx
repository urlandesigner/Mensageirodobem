import type { Metadata } from "next";
import { ReceberView } from "@/components/receber/ReceberView";

export const metadata: Metadata = {
  title: "Pagamento PIX · Mensageiro do Bem",
  description: "Um gesto rapido por PIX para abrir sua mensagem com carinho.",
};

export default function ReceberPage() {
  return <ReceberView />;
}
