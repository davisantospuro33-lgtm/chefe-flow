import { useState } from "react";
import { Zap, Calendar } from "lucide-react";
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
  const pessoas = useChefeStore((s) => s.pessoasNoSalao);
  const queue = useChefeStore((s) => s.queue);
  const status = useChefeStore((s) => s.status);
  const durationMin = useChefeStore((s) => s.profile.serviceDurationMin);
  const eta = queue.length * (durationMin || 30);
  const closed = status === "closed";

  const cards = [
    {
      key: "salao" as const,
      icon: Users,
      label: "No Salão Agora",
      value: String(pessoas),
      hint: pessoas === 0 ? "Tranquilo" : "No sofá",
      disabled: false,
      highlight: false,
    },
    {
      key: "encaixe" as const,
      icon: Zap,
      label: "Encaixe Virtual",
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
      label: "Agenda",
      value: "•",
      hint: closed ? "Marcar para amanhã" : "Marcar horário",
      disabled: false,
      highlight: closed,
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              disabled={c.disabled}
              onClick={() => !c.disabled && setSheet(c.key)}
              className={`flex flex-col items-start gap-1 rounded-2xl glass-strong border p-3 text-left transition-transform active:scale-95 ${
                c.disabled
                  ? "border-border opacity-40 cursor-not-allowed active:scale-100"
                  : c.highlight
                    ? "border-foreground/40 ring-1 ring-foreground/30"
                    : "border-border"
              }`}
            >
              <Icon className="h-4 w-4 text-foreground/80" />
              <span className="text-[9px] font-black uppercase leading-tight tracking-wider text-muted-foreground">
                {c.label}
              </span>
              <span className="text-lg font-black leading-none tabular-nums text-foreground">
                {c.value}
              </span>
              <span className="text-[9px] font-semibold text-muted-foreground">{c.hint}</span>
            </button>
          );
        })}
      </div>

      <Drawer open={sheet !== null} onOpenChange={(o) => !o && setSheet(null)}>
        <DrawerContent className="max-h-[88vh] overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle className="text-sm font-black uppercase tracking-widest">
              {sheet === "encaixe" && "Encaixe virtual"}
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