import { useState } from "react";
import { Zap, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useChefeStore } from "@/lib/chefe-store";
import { QueueList } from "./QueueList";
import { AgendaBooking } from "./AgendaBooking";
import { useSchedule } from "@/lib/use-schedule";

type TabType = "encaixe" | "agenda";

export function CopilotoGrid() {
  const [activeTab, setActiveTab] = useState<TabType>("encaixe");
  
  const status = useChefeStore((s) => s.status);
  const { queue, waitMinutes: eta } = useSchedule();
  const closed = status === "closed";

  const tabs = [
    {
      key: "encaixe" as const,
      icon: Zap,
      label: "ENCAIXE VIRTUAL",
      value: String(queue.length),
      hint: closed
        ? "Indisponível hoje"
        : queue.length === 0
          ? status === "available"
            ? "Entre agora"
            : "Zero espera"
          : `Na fila • ~${eta} min`,
      disabled: closed,
      content: <QueueList />,
    },
    {
      key: "agenda" as const,
      icon: Calendar,
      label: "AGENDA",
      value: "•",
      hint: closed ? "Marcar para amanhã" : "Marcar horário",
      disabled: false,
      content: <AgendaBooking />,
    },
  ];

  const activeTabData = tabs.find((t) => t.key === activeTab)!;

  return (
    <div className="flex flex-col gap-4">
      {/* Tab Navigation Header */}
      <div className="flex items-center gap-0 rounded-2xl glass-strong border border-border overflow-hidden">
        {tabs.map((tab, idx) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <motion.button
              key={tab.key}
              onClick={() => !tab.disabled && setActiveTab(tab.key)}
              disabled={tab.disabled}
              className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 text-sm font-bold uppercase tracking-wider transition-colors relative ${
                tab.disabled
                  ? "opacity-40 cursor-not-allowed text-foreground/40"
                  : isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground/70"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{tab.label}</span>

              {/* Active State Indicator Line */}
              {isActive && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-foreground/40 to-foreground"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.2 }}
        className="rounded-2xl glass-strong border border-border p-4"
      >
        {/* Dynamic Content Display */}
        <div className="space-y-3">
          {/* Title Label */}
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {activeTabData.label}
          </span>

          {/* Metric Display */}
          <div>
            <span className="text-3xl font-black leading-none tabular-nums text-foreground">
              {activeTabData.value}
            </span>
          </div>

          {/* Subtext */}
          <span className="text-xs text-muted-foreground block">
            {activeTabData.hint}
          </span>

          {/* Drawer Content */}
          <div className="mt-4 pt-3 border-t border-border/50">
            {activeTabData.content}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
