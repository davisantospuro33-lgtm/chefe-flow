import { useChefeStore } from "@/lib/chefe-store";

export function StatusBadge() {
  const status = useChefeStore((s) => s.status);
  const queue = useChefeStore((s) => s.queue);
  const presencialCount = useChefeStore((s) => s.presencialCount);
  const total = queue.length + presencialCount;

  const statusConfig = {
    available: {
      label: total === 0 ? "DISPONÍVEL AGORA" : "ATENDENDO · FILA ABERTA",
      color: "bg-emerald-500",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
    },
    busy: {
      label: "LOTADO · APENAS ENCAIXE",
      color: "bg-amber-500",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
    },
    break: {
      label: "PAUSA RÁPIDA · VOLTA EM BREVE",
      color: "bg-blue-500",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
    },
    closed: {
      label: "SALÃO FECHADO",
      color: "bg-rose-500",
      textColor: "text-rose-400",
      borderColor: "border-rose-500/30",
    },
  };

  const current = statusConfig[status] || statusConfig.available;

  return (
    <div className={`flex items-center gap-2 rounded-full bg-black/60 px-3.5 py-1.5 border ${current.borderColor} backdrop-blur-md`}>
      <span className={`h-2 w-2 rounded-full ${current.color} animate-pulse`} />
      <span className={`text-[10px] font-black tracking-wider uppercase ${current.textColor}`}>
        {current.label}
      </span>
    </div>
  );
}
