import { motion, AnimatePresence } from "framer-motion";
import { useChefeStore } from "@/lib/chefe-store";

interface Props {
  compact?: boolean;
}

export function QueueList({ compact = false }: Props) {
  const queue = useChefeStore((s) => s.queue);
  const presencial = useChefeStore((s) => s.presencialCount);

  const visible = compact ? queue.slice(0, 3) : queue;

  return (
    <div className={`glass rounded-3xl ${compact ? "p-3.5" : "p-5"}`}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {compact ? "Sequência Virtual" : "Fila da Agenda Virtual"}
        </p>
        <span className="text-[11px] font-semibold text-foreground/70">
          {queue.length} {queue.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </div>

      {queue.length === 0 ? (
        <p className={`rounded-2xl bg-white/[0.03] px-3 py-3 text-center text-xs text-muted-foreground ${compact ? "py-4" : ""}`}>
          Fila vazia no momento.
        </p>
      ) : (
        <ul className={`space-y-1.5 ${compact ? "max-h-[140px] overflow-y-auto" : ""}`}>
          <AnimatePresence initial={false}>
            {visible.map((c, i) => (
              <motion.li
                key={c.id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                className={`flex items-center justify-between rounded-xl ${compact ? "px-2 py-1.5" : "rounded-2xl px-3 py-2.5"} ${
                  i === 0 ? "bg-neon/10 ring-1 ring-neon/40" : "bg-white/[0.03]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`grid shrink-0 place-items-center rounded-full font-black ${compact ? "h-6 w-6 text-[10px]" : "h-8 w-8 text-xs"}`}
                    style={{
                      background:
                        i === 0 ? "var(--gradient-ig)" : "color-mix(in oklab, var(--surface-2) 90%, transparent)",
                      color: i === 0 ? "#fff" : "var(--muted-foreground)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span className={`${compact ? "text-xs" : "text-sm"} font-semibold text-foreground/90 truncate`}>
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

      {compact && queue.length > 3 && (
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
          +{queue.length - 3} na fila
        </p>
      )}

      {presencial > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 rounded-xl px-2.5 py-2 text-[11px] font-semibold"
          style={{
            background: "rgba(245, 158, 11, 0.1)",
            border: "1px solid rgba(245, 158, 11, 0.3)",
            color: "#fbbf24",
          }}
        >
          ⚠️ +{presencial} {presencial === 1 ? "cliente presencial" : "clientes presenciais"} no balcão.
        </motion.div>
      )}
    </div>
  );
}
