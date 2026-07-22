      import { motion, AnimatePresence } from "framer-motion";
import { useChefeStore } from "@/lib/chefe-store";

interface Props {
  compact?: boolean;
}

export function QueueList({ compact = false }: Props) {
  const queue = useChefeStore((s) => s.queue);
  const presencial = useChefeStore((s) => s.presencialCount);
  const visible = compact ? queue.slice(0, 2) : queue;

  if (compact) {
    return (
      <div className="flex h-full flex-col justify-between rounded-3xl glass-strong p-3 border border-white/10">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground leading-tight">
              ⚡ Encaixe Virtual
            </p>
            <span className="text-[9px] font-bold text-neon">
              {queue.length} na fila
            </span>
          </div>
          <p className="mt-1 text-[10px] font-bold text-white leading-tight">
            Entrar na Fila
          </p>
        </div>

        {queue.length === 0 ? (
          <div className="my-1 rounded-xl bg-white/[0.04] p-2 text-center">
            <span className="text-[10px] font-semibold text-emerald-400">
              Zero espera! Chegue e corte.
            </span>
          </div>
        ) : (
          <ul className="my-1 space-y-1">
            {visible.map((c, i) => (
              <li key={c.id} className="flex items-center justify-between text-[10px] text-white/80">
                <span className="truncate max-w-[70px]">{i + 1}. {c.name}</span>
                {i === 0 && <span className="text-[8px] font-bold text-neon">PRÓXIMO</span>}
              </li>
            ))}
          </ul>
        )}

        <button className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-sm active:scale-95 transition-transform">
          Pedir Encaixe ➔
        </button>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Fila de Encaixe Virtual
        </p>
        <span className="text-[11px] font-semibold text-foreground/70">
          {queue.length} {queue.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </div>

      {queue.length === 0 ? (
        <p className="rounded-2xl bg-white/[0.03] px-3 py-3 text-center text-xs text-muted-foreground">
          Fila zerada. Chegou, cortou!
        </p>
      ) : (
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {visible.map((c, i) => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className={`flex items-center justify-between rounded-2xl px-3 py-2.5 ${
                  i === 0 ? "bg-neon/10 ring-1 ring-neon/40" : "bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full font-black text-xs"
                    style={{
                      background: i === 0 ? "var(--gradient-ig)" : "color-mix(in oklab, var(--surface-2) 90%, transparent)",
                      color: i === 0 ? "#fff" : "var(--muted-foreground)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-sm font-semibold text-foreground/90 truncate">
                    {c.name}
                  </span>
                </div>
                {i === 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neon">Próximo</span>
                )}
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {presencial > 0 && (
        <div
          className="mt-2 rounded-xl px-2.5 py-2 text-[11px] font-semibold"
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fbbf24",
          }}
        >
          ⚠️ +{presencial} {presencial === 1 ? "cliente presencial" : "clientes presenciais"} no balcão.
        </div>
      )}
    </div>
  );
}
