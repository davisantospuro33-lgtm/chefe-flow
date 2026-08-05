import { CalendarDays, Trash2, Check, MessageCircle } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { toast } from "sonner";

export function AgendaAdmin() {
  const agenda = useChefeStore((s) => s.agenda);
  const cancelAgenda = useChefeStore((s) => s.cancelAgenda);
  const confirmAgenda = useChefeStore((s) => s.confirmAgenda);

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
                  <span
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      a.status === "confirmado"
                        ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/30"
                        : "bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/30"
                    }`}
                  >
                    {a.status === "confirmado" ? "Confirmado" : "Pendente"}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                {a.status !== "confirmado" && (
                  <button
                    onClick={async () => {
                      await confirmAgenda(a.id);
                      toast.success(`Horário de ${a.name} confirmado`);
                    }}
                    className="rounded-xl bg-emerald-500/15 px-2 py-1.5 text-emerald-300 ring-1 ring-emerald-400/30"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
                {a.phone && (
                  <button
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Fala ${a.name.split(" ")[0]}! Aqui é o CHEFE. Podemos remarcar seu horário?`,
                      );
                      window.open(
                        `https://api.whatsapp.com/send?phone=${a.phone!.replace(/\D/g, "")}&text=${msg}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="rounded-xl bg-amber-500/15 px-2 py-1.5 text-amber-300 ring-1 ring-amber-400/30"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </button>
                )}
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
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}