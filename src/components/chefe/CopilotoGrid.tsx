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
      title: "ENCAIXE VIRTUAL",
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
    },
    {
      key: "agenda" as const,
      icon: Calendar,
      title: "AGENDA",
      value: "•",
      hint: closed ? "Marcar para amanhã" : "Marcar horário",
      disabled: false,
      highlight: closed,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
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
              className={`flex flex-col rounded-2xl glass-strong border transition-all overflow-hidden ${
                c.disabled
                  ? "border-border opacity-40 cursor-not-allowed"
                  : c.highlight
                    ? "border-foreground/40 ring-2 ring-foreground/20 hover:ring-foreground/30"
                    : "border-border hover:border-border/80"
              }`}
            >
              {/* Top Icon Tab Header */}
              <div className={`flex items-center justify-center w-full py-2 px-3 ${
                c.disabled ? "bg-foreground/5" : "bg-foreground/5 hover:bg-foreground/8"
              } transition-colors`}>
                <Icon className={`h-5 w-5 ${c.disabled ? "text-foreground/30" : "text-foreground/60"}`} />
              </div>

              {/* Card Content */}
              <div className="flex flex-col flex-1 p-3 gap-1.5">
                {/* Title Label */}
                <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {c.title}
                </span>

                {/* Metric Counter */}
                <span className="text-2xl font-black leading-none tabular-nums text-foreground">
                  {c.value}
                </span>

                {/* Subtext Call-To-Action */}
                <span className="text-xs text-muted-foreground mt-0.5">
                  {c.hint}
                </span>
              </div>
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
