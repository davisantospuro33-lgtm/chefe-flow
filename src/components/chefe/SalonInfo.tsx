import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function SalonInfo() {
  const pessoas = useChefeStore((s) => s.pessoasNoSalao);
  const label =
    pessoas === 0
      ? "Salão tranquilo — sem espera presencial agora."
      : pessoas === 1
        ? "1 pessoa aguardando presencialmente no salão."
        : `${pessoas} pessoas aguardando presencialmente no salão.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-[1.5px]"
      style={{
        background: pessoas > 0
          ? "linear-gradient(135deg,rgba(245,158,11,0.6),rgba(233,65,121,0.6))"
          : "linear-gradient(135deg,rgba(34,197,94,0.5),rgba(14,165,233,0.5))",
      }}
    >
      <div className="flex items-center gap-3 rounded-[calc(1.5rem-1.5px)] glass-strong p-4">
        <div
          className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl"
          style={{
            background: pessoas > 0
              ? "linear-gradient(135deg,#f59e0b,#e94179)"
              : "linear-gradient(135deg,#22c55e,#0ea5e9)",
          }}
        >
          <Users className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            📍 No Salão Agora
          </p>
          <p className="mt-0.5 text-sm font-bold leading-tight text-white">{label}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-lg font-black tabular-nums text-white">
          {pessoas}
        </span>
      </div>
    </motion.div>
  );
}