import { CalendarDays, Trash2 } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { toast } from "sonner";

export function AgendaAdmin() {
  const agenda = useChefeStore((s) => s.agenda);
  const cancelAgenda = useChefeStore((s) => s.cancelAgenda);

  const upcoming = agenda
    .filter((a) => a.scheduledAt > Date.now() - 30 * 60_000)
    .sort((a, b) => a.scheduledAt - b.scheduledAt);

  return (
    <section className="glass rounded-3xl p-5">
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-sky-300" />
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Agenda ({upcoming.length})
        </p>
      </div>
      {upcoming.length === 0 ? (
        <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
          Nenhum horário marcado.
        </p>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((a) => {
            const d = new Date(a.scheduledAt);
            return (
              <li
                key={a.id}
                className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{a.name}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {d.toLocaleString("pt-BR", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {a.phone ? ` · ${a.phone}` : ""}
                  </p>
                </div>
                <button
                  onClick={async () => {
                    if (!confirm(`Cancelar reserva de ${a.name}?`)) return;
                    await cancelAgenda(a.id);
                    toast("Reserva cancelada");
                  }}
                  className="rounded-xl bg-rose-500/15 px-2 py-1.5 text-rose-300 ring-1 ring-rose-400/30"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}