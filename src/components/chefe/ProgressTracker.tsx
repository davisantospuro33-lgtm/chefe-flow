import { motion } from "framer-motion";
import { Users, DoorOpen, Scissors, CheckCircle2 } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

const steps = [
  { key: "queue", label: "Na Fila", icon: Users },
  { key: "leave", label: "Hora de Sair", icon: DoorOpen },
  { key: "chair", label: "Na Cadeira", icon: Scissors },
  { key: "done", label: "Concluído", icon: CheckCircle2 },
];

export function ProgressTracker() {
  const stage = useChefeStore((s) => s.stage);
  const pct = (stage / (steps.length - 1)) * 100;

  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Acompanhamento
        </p>
        <span className="rounded-full bg-neon/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-neon">
          Ao vivo
        </span>
      </div>

      <div className="relative">
        <div className="absolute left-5 right-5 top-5 h-[3px] rounded-full bg-white/10" />
        <motion.div
          className="absolute left-5 top-5 h-[3px] rounded-full bg-gradient-ig"
          initial={false}
          animate={{ width: `calc((100% - 40px) * ${pct / 100})` }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
          style={{ boxShadow: "0 0 20px rgba(233,65,121,0.5)" }}
        />

        <div className="relative grid grid-cols-4 gap-2">
          {steps.map((step, i) => {
            const active = i <= stage;
            const current = i === stage;
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex flex-col items-center gap-2">
                <motion.div
                  animate={current ? { scale: [1, 1.1, 1] } : undefined}
                  transition={{ duration: 1.8, repeat: Infinity }}
                  className="grid h-10 w-10 place-items-center rounded-full"
                  style={{
                    background: active
                      ? "var(--gradient-ig)"
                      : "color-mix(in oklab, var(--surface-2) 80%, transparent)",
                    border: active ? "none" : "1px solid var(--color-border)",
                    boxShadow: current ? "0 0 24px rgba(233,65,121,0.6)" : undefined,
                  }}
                >
                  <Icon
                    style={{
                      color: active ? "#fff" : "var(--muted-foreground)",
                      width: 18,
                      height: 18,
                    }}
                  />
                </motion.div>
                <span
                  className={`text-center text-[10px] font-semibold leading-tight ${
                    active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}