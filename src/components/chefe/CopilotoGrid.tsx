import { useState } from "react";
import { Users, Zap, Calendar } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useChefeStore } from "@/lib/chefe-store";
import { QueueList } from "./QueueList";
import { AgendaBooking } from "./AgendaBooking";
import { SalonInfo } from "./SalonInfo";

type Sheet = "salao" | "encaixe" | "agenda" | null;

export function CopilotoGrid() {
  const [sheet, setSheet] = useState<Sheet>(null);
  const pessoas = useChefeStore((s) => s.pessoasNoSalao);
  const queue = useChefeStore((s) => s.queue);

  const cards = [
    {
      key: "salao" as const,
      icon: Users,
      label: "No Salão Agora",
      value: String(pessoas),
      hint: pessoas === 0 ? "Tranquilo" : "No sofá",
    },
    {
      key: "encaixe" as const,
      icon: Zap,
      label: "Encaixe Virtual",
      value: String(queue.length),
      hint: queue.length === 0 ? "Zero espera" : "Na fila",
    },
    {
      key: "agenda" as const,
      icon: Calendar,
      label: "Agenda",
      value: "•",
      hint: "Marcar horário",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.key}
              onClick={() => setSheet(c.key)}
              className="flex flex-col items-start gap-1 rounded-2xl glass-strong border border-border p-3 text-left transition-transform active:scale-95"
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
              {sheet === "salao" && "No salão agora"}
              {sheet === "encaixe" && "Encaixe virtual"}
              {sheet === "agenda" && "Agenda"}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-8">
            {sheet === "salao" && <SalonInfo />}
            {sheet === "encaixe" && <QueueList />}
            {sheet === "agenda" && <AgendaBooking />}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}