import { useChefeStore } from "@/lib/chefe-store";
import { Users } from "lucide-react";

export const STATUS_CONFIG = {
  available: {
    label: "DISPONÍVEL AGORA",
    title: "Chefe livre! Chegue e corte.",
    sub: "Atendimento imediato no salão. Sem espera.",
    dot: "bg-emerald-500",
    text: "text-emerald-400",
    badge: "bg-gradient-to-r from-emerald-500/20 to-emerald-400/5 ring-1 ring-emerald-500/30",
  },
  busy: {
    label: "ATENDENDO AGORA",
    title: "Chefe ocupado no atendimento.",
    sub: "Atendendo cliente no momento. Acompanhe a fila virtual abaixo ou peça seu encaixe.",
    dot: "bg-foreground",
    text: "text-foreground",
    badge: "bg-foreground/10 ring-1 ring-foreground/30",
  },
  break: {
    label: "EM PAUSA RÁPIDA",
    title: "Chefe deu uma pausa rápida.",
    sub: "Volto em breve (10 a 20 min). Você já pode entrar na fila ou agendar seu horário.",
    dot: "bg-amber-400",
    text: "text-amber-300",
    badge: "bg-gradient-to-r from-amber-500/20 to-amber-400/5 ring-1 ring-amber-500/30",
  },
  closed: {
    label: "EXPEDIENTE ENCERRADO",
    title: "Atendimento encerrado por hoje.",
    sub: "Retornamos amanhã às 9h. Garanta o primeiro horário ou agende para amanhã.",
    dot: "bg-rose-500",
    text: "text-rose-400",
    badge: "bg-gradient-to-r from-rose-500/20 to-rose-400/5 ring-1 ring-rose-500/30",
  },
} as const;

export function StatusCard() {
  const status = useChefeStore((s) => s.status);
  const queue = useChefeStore((s) => s.queue);
  const pessoas = useChefeStore((s) => s.pessoasNoSalao);
  const durationMin = useChefeStore((s) => s.profile.serviceDurationMin);
  const extra = useChefeStore((s) => s.extraMinutes);
  const current = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;

  const eta = queue.length * (durationMin || 30) + (extra || 0);

  return (
    <section className="rounded-2xl glass-strong border border-border p-4">
      <div className="flex flex-row items-start justify-between gap-4">
        {/* Left column: status content */}
        <div className="flex-1 min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Status em tempo real
          </p>
          <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 ${current.badge}`}>
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
          <p className="mt-1 text-xs font-semibold leading-snug text-muted-foreground">
            {current.sub}
          </p>

          {status === "busy" && queue.length > 0 && (
            <p className="mt-2 rounded-xl bg-foreground/5 px-3 py-2 text-[11px] font-bold text-foreground/80">
              {queue.length} {queue.length === 1 ? "pessoa" : "pessoas"} na fila • Tempo estimado: {eta} min
            </p>
          )}
        </div>

        {/* Right column: No salão agora mini-card */}
        <div className="shrink-0 text-center min-w-[110px] rounded-xl bg-secondary/40 border border-border/50 p-3">
          <Users className="mx-auto h-4 w-4 text-foreground/80 mb-1" />
          <p className="text-[8px] font-black uppercase tracking-wider text-muted-foreground">
            No Salão Agora
          </p>
          <p className="text-2xl font-black leading-none tabular-nums text-foreground">
            {pessoas}
          </p>
          <p className="text-xs text-muted-foreground">Fila presencial</p>
        </div>
      </div>
    </section>
  );
}