import { motion, AnimatePresence } from "framer-motion";
import { useChefeStore } from "@/lib/chefe-store";

export function QueueList() {
  const queue = useChefeStore((s) => s.queue);

  return (
    <div className="glass rounded-3xl p-5">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Fila em tempo real
        </p>
        <span className="text-[11px] font-semibold text-foreground/70">
          {queue.length} {queue.length === 1 ? "pessoa" : "pessoas"}
        </span>
      </div>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {queue.map((c, i) => (
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
              <div className="flex items-center gap-3">
                <div
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-black"
                  style={{
                    background:
                      i === 0 ? "var(--gradient-ig)" : "color-mix(in oklab, var(--surface-2) 90%, transparent)",
                    color: i === 0 ? "#fff" : "var(--muted-foreground)",
                  }}
                >
                  {i + 1}
                </div>
                <span className="text-sm font-semibold text-foreground/90">{c.name}</span>
              </div>
              {i === 0 && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-neon">Próximo</span>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  );
}