import { motion } from "framer-motion";
import { Scissors, Clock, ChevronRight } from "lucide-react";

export function ServiceCard() {
  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      className="group relative w-full overflow-hidden rounded-3xl p-[1.5px] text-left"
    >
      <div className="absolute inset-0 bg-gradient-ig" />
      <div className="relative flex items-center gap-4 rounded-[calc(1.5rem-1.5px)] glass-strong p-5">
        <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-ig">
          <Scissors className="h-6 w-6 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Serviço principal</p>
          <p className="truncate text-lg font-black text-foreground">Corte CHEFE</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span>40 min</span>
            <span>·</span>
            <span className="font-bold text-gradient-ig">R$ 25,00</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-emerald-300 ring-1 ring-emerald-400/30">
              <Clock className="h-3 w-3" /> 9h–20h
            </span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
      </div>
    </motion.button>
  );
}