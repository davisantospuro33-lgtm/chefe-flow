import { createFileRoute } from "@tanstack/react-router";
import { EliteAuthGate } from "@/features/auth/EliteAuthGate";

export const Route = createFileRoute("/")({
  component: EliteAuthGate,
  head: () => ({
    meta: [
      { title: "CHEFE · Atendimento elevado" },
      { name: "description", content: "Encontre profissionais excepcionais ou assuma o comando da sua operação com o CHEFE." },
      { property: "og:title", content: "CHEFE · Atendimento elevado" },
      { property: "og:description", content: "A cidade inteira na sua mão." },
    ],
  }),
});
