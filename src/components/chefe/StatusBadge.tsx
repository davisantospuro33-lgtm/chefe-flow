import { motion } from "framer-motion";
import { useChefeStore, statusMeta } from "@/lib/chefe-store";

export function StatusBadge() {
  const status = useChefeStore((s) => s.status);
  const meta = statusMeta[status];
  const isLive = status === "available";

  return (
    <motion.div
      initial={{ y: 8, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="inline-flex items-center gap-2 rounded-full glass-strong px-4 py-2 text-sm font-semibold"
    >
      <span className="relative flex h-2.5 w-2.5">
        {isLive && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-neon opacity-75" />
        )}
        <span
          className="relative inline-flex h-2.5 w-2.5 rounded-full"
          style={{
            background: isLive ? "var(--neon)" : "var(--muted-foreground)",
            boxShadow: isLive ? "0 0 12px var(--neon-glow)" : undefined,
          }}
        />
      </span>
      <span className={isLive ? "text-neon" : "text-foreground/80"}>
        {isLive ? "Disponível no Momento" : meta.label}
      </span>
    </motion.div>
  );
}