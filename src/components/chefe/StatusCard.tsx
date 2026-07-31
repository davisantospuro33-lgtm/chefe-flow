import { useChefeStore } from "@/lib/chefe-store";

const CONFIG = {
  available: {
    label: "DISPONÍVEL AGORA",
    title: "Chefe livre! Chegue e corte.",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
  },
  busy: {
    label: "ATENDENDO NO MOMENTO",
    title: "Foco total no corte atual.",
    dot: "bg-cyan-400",
    text: "text-cyan-300",
  },
  break: {
    label: "PAUSA RÁPIDA",
    title: "Recarregando. Volto já!",
    dot: "bg-amber-400",
    text: "text-amber-300",
  },
  closed: {
    label: "ATENDIMENTO ENCERRADO",
    title: "Agenda fechada por hoje.",
    dot: "bg-rose-500",
    text: "text-rose-400",
  },
} as const;

export function StatusCard() {
  const status = useChefeStore((s) => s.status);
  const current = CONFIG[status] ?? CONFIG.available;

  return (
    <section className="rounded-2xl glass-strong border border-border p-4">
      <span className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-2.5 py-1">
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${current.dot}`} />
          <span className={`relative inline-flex h-2 w-2 rounded-full ${current.dot}`} />
        </span>
        <span className={`text-[10px] font-black uppercase tracking-widest ${current.text}`}>
          {current.label}
        </span>
      </span>

      <h2 className="mt-2 text-lg font-black leading-tight tracking-tight text-foreground">
        {current.title}
      </h2>
    </section>
  );
}