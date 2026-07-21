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
      className="relative overflow-hidden rounded-3xl"
      style={{
        background:
          "linear-gradient(135deg, rgba(14,165,233,0.15) 0%, rgba(30,58,138,0.28) 100%)",
        border: "1px solid rgba(14,165,233,0.4)",
        boxShadow:
          "0 0 24px rgba(14,165,233,0.18), inset 0 0 40px rgba(14,165,233,0.06)",
      }}
    >
      <div className="relative p-5">
        <div className="mb-3 flex items-center gap-2">
          <div
            className="grid h-8 w-8 place-items-center rounded-full"
            style={{
              background:
                "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 60%, #1e3a8a 100%)",
              boxShadow: "0 0 16px rgba(56,189,248,0.5)",
            }}
          >
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p
            className="text-[11px] font-black uppercase tracking-widest"
            style={{ color: "#38bdf8" }}
          >
            CHEFE AI · Alerta Inteligente
          </p>
        </div>

        <p className="text-base leading-snug" style={{ color: "#e0f2fe" }}>
          <span className="font-bold">Sua vez é a próxima!</span> Com base na sua distância atual{" "}
          <span className="font-bold" style={{ color: "#38bdf8" }}>
            ({distanceKm.toFixed(1)} km)
          </span>
          , saia de casa{" "}
          <span className="font-bold" style={{ color: "#38bdf8" }}>agora</span> para chegar com
          antecedência e não se atrasar.
        </p>

        <div
          className="mt-4 flex items-center justify-between rounded-2xl p-3"
          style={{ background: "rgba(14,165,233,0.1)" }}
        >
          <div className="flex items-center gap-2">
            <Navigation2 className="h-4 w-4" style={{ color: "#38bdf8" }} />
            <span className="text-xs text-muted-foreground">Tempo estimado até o salão</span>
          </div>
          <span
            className="text-lg font-black tabular-nums"
            style={{ color: "#38bdf8", textShadow: "0 0 12px rgba(56,189,248,0.5)" }}
          >
            ~ {etaMin} min
          </span>
        </div>
      </div>
    </motion.div>
  );
}