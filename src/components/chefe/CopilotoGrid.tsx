import { useState } from "react";
import { Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useChefeStore } from "@/lib/chefe-store";
import { QueueList } from "./QueueList";
import { AgendaBooking } from "./AgendaBooking";

type Sheet = "encaixe" | "agenda" | null;

export function CopilotoGrid() {
  const [sheet, setSheet] = useState<Sheet>(null);
  
  const queue = useChefeStore((s) => s.queue);
  const status = useChefeStore((s) => s.status);
  const durationMin = useChefeStore((s) => s.profile.serviceDurationMin);
  const eta = queue.length * (durationMin || 30);
  const closed = status === "closed";

  const cards = [
    {
      key: "encaixe" as const,
      icon: Zap,
      value: String(queue.length),
      hint: closed
        ? "Indisponível hoje"
        : queue.length === 0
          ? status === "available"
            ? "Entre agora"
            : "Zero espera"
          : `Na fila • ~${eta} min`,
      disabled: closed,
      highlight: !closed && (status === "available" || status === "busy" || status === "break"),
      aria: "Encaixe Virtual",
    },
    {
      key: "agenda" as const,
      icon: Calendar,
      value: "•",
      hint: closed ? "Marcar para amanhã" : "Marcar horário",
      disabled: false,
      highlight: closed,
      aria: "Agenda",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <motion.button
              key={c.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * idx }}
              whileHover={!c.disabled ? { scale: 1.02 } : {}}
              whileTap={!c.disabled ? { scale: 0.96 } : {}}
              disabled={c.disabled}
              onClick={() => !c.disabled && setSheet(c.key)}
              className={`flex flex-col items-center justify-center gap-2 rounded-2xl glass-strong border p-4 transition-all ${
                c.disabled
                  ? "border-border opacity-40 cursor-not-allowed"
                  : c.highlight
                    ? "border-foreground/40 ring-2 ring-foreground/20 hover:ring-foreground/30"
                    : "border-border hover:border-border/80"
              }`}
              aria-label={c.aria}
            >
              {/* Icon - Prominently Styled */}
              <Icon className={`h-6 w-6 transition-transform ${c.disabled ? "text-foreground/40" : "text-foreground/70 group-hover:scale-110"}`} />
              
              {/* Metric - Big Number */}
              <span className="text-2xl font-black leading-none tabular-nums text-foreground">
                {c.value}
              </span>
              
              {/* Subtext - Action Label */}
              <span className="text-[11px] font-semibold text-muted-foreground text-center">
                {c.hint}
              </span>
            </motion.button>
          );
        })}
      </div>

      <Drawer open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)}>
        <DrawerContent className="max-h-[88vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="text-sm font-black uppercase tracking-widest">
              {sheet === "encaixe" && "Encaixe Virtual"}
              {sheet === "agenda" && "Agenda"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8">
            {sheet === "encaixe" && <QueueList />}
            {sheet === "agenda" && <AgendaBooking />}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}
