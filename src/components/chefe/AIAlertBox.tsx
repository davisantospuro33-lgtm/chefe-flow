import { motion } from "framer-motion";
import { Sparkles, Navigation2 } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function AIAlertBox() {
  const distanceKm = useChefeStore((s) => s.distanceKm);
  const extra = useChefeStore((s) => s.extraMinutes);
  const etaMin = Math.max(3, Math.round(distanceKm * 3) + extra);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl p-[1.5px]"
    >
      <div className="absolute inset-0 bg-gradient-ig" />
      <div className="absolute inset-0 animate-shimmer opacity-60" />
      <div className="relative rounded-[calc(1.5rem-1.5px)] glass-strong p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-ig">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gradient-ig">
            CHEFE AI · Alerta Inteligente
          </p>
        </div>

        <p className="text-base leading-snug text-foreground">
          <span className="font-bold">Sua vez é a próxima!</span> Com base na sua distância atual{" "}
          <span className="text-gradient-ig font-bold">({distanceKm.toFixed(1)} km)</span>, saia de casa{" "}
          <span className="text-neon font-bold">agora</span> para chegar com antecedência e não se atrasar.
        </p>

        <div className="mt-4 flex items-center justify-between rounded-2xl bg-black/30 p-3">
          <div className="flex items-center gap-2">
            <Navigation2 className="h-4 w-4 text-neon" />
            <span className="text-xs text-muted-foreground">Tempo estimado até o salão</span>
          </div>
          <span className="text-lg font-black tabular-nums text-neon">~ {etaMin} min</span>
        </div>
      </div>
    </motion.div>
  );
}