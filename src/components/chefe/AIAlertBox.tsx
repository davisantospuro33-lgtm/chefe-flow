import { motion } from "framer-motion";
import { Sparkles, Navigation2, Clock } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function AIAlertBox() {
  const distanceKm = useChefeStore((s) => s.distanceKm) ?? 0;
  const extra = useChefeStore((s) => s.extraMinutes) ?? 0;
  // Tempo puro de trajeto (approx 3 min/km em cenário urbano) + atrasos globais da fila
  const travelMin = Math.max(3, Math.round(distanceKm * 3) + extra);
  // Regra fixa: cliente precisa chegar 10 min ANTES da vez.
  const BUFFER_MIN = 10;
  const leaveInMin = travelMin + BUFFER_MIN;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-sky-200 bg-white shadow-[0_0_24px_rgba(14,165,233,0.10)] dark:border-sky-400/40 dark:bg-[linear-gradient(135deg,rgba(14,165,233,0.15)_0%,rgba(30,58,138,0.28)_100%)] dark:shadow-[0_0_24px_rgba(14,165,233,0.18),inset_0_0_40px_rgba(14,165,233,0.06)]"
    >
      <div className="relative p-5">
        <div className="mb-3 flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-full bg-[linear-gradient(135deg,#38bdf8_0%,#0ea5e9_60%,#1e3a8a_100%)] shadow-[0_0_16px_rgba(56,189,248,0.5)]">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-sky-700 dark:text-sky-400">
            CHEFE AI · Alerta Inteligente
          </p>
        </div>

        <p className="text-base leading-snug text-slate-900 dark:text-sky-100">
          <span className="font-bold">Sua vez é a próxima!</span> Com base na sua localização{" "}
          <span className="font-bold text-sky-700 dark:text-sky-400">
            ({distanceKm.toFixed(1)} km)
          </span>{" "}
          e para você chegar com{" "}
          <span className="font-bold text-sky-700 dark:text-sky-400">10 min de antecedência</span>,
          saia em <span className="font-bold text-sky-700 dark:text-sky-400">{leaveInMin} min</span>
          .
        </p>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between rounded-2xl bg-sky-50 p-3 dark:bg-sky-500/10">
            <div className="flex items-center gap-2">
              <Navigation2 className="h-4 w-4 text-sky-700 dark:text-sky-400" />
              <span className="text-[10px] text-slate-600 dark:text-sky-200/70">Trajeto GPS</span>
            </div>
            <span className="text-base font-black tabular-nums text-sky-700 dark:text-sky-400">
              {travelMin}min
            </span>
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-sky-100 p-3 dark:bg-sky-500/20">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-700 dark:text-sky-400" />
              <span className="text-[10px] text-slate-600 dark:text-sky-200/70">
                Saia em (+10min)
              </span>
            </div>
            <span className="text-lg font-black tabular-nums text-sky-700 dark:text-sky-400 dark:[text-shadow:0_0_12px_rgba(56,189,248,0.5)]">
              {leaveInMin}min
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
