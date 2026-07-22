import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function SalonInfo() {
  const pessoas = useChefeStore((s) => s.pessoasNoSalao);
  const label =
    pessoas === 0
      ? "Salão tranquilo."
      : pessoas === 1
        ? "1 pessoa no sofá."
        : `${pessoas} pessoas no sofá.`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full rounded-3xl p-[1.5px]"
      style={{
        background: pessoas > 0
          ? "linear-gradient(135deg,rgba(245,158,11,0.6),rgba(233,65,121,0.6))"
          : "linear-gradient(135deg,rgba(34,197,94,0.5),rgba(14,165,233,0.5))",
      }}
    >
      <div className="flex h-full flex-col justify-between rounded-[calc(1.5rem-1.5px)] glass-strong p-3.5">
        <div className="flex items-center gap-2">
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{
              background: pessoas > 0
                ? "linear-gradient(135deg,#f59e0b,#e94179)"
                : "linear-gradient(135deg,#22c55e,#0ea5e9)",
            }}
          >
            <Users className="h-4 w-4 text-white" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground leading-tight">
            📍 No Salão<br />Agora
          </p>
        </div>
        <p className="mt-2 text-xs font-bold leading-tight text-white">{label}</p>
        <span className="mt-2 self-center rounded-full bg-white/10 px-3 py-1 text-2xl font-black tabular-nums text-white">
          {pessoas}
        </span>
      </div>
    </motion.div>
  );
}
