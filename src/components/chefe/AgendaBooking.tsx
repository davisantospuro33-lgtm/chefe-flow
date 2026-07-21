import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CalendarDays, Clock, Check, Loader2, X } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { toast } from "sonner";
import { subscribeToPush } from "@/lib/push-client";

const OPEN_HOUR = 9;
const CLOSE_HOUR = 20;
const STORAGE_KEY = "chefe.myBooking";

type SavedBooking = { id: string; name: string; phone: string; scheduledAt: number };

function readSaved(): SavedBooking | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedBooking) : null;
  } catch {
    return null;
  }
}

function fmtDay(d: Date) {
  return d.toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit" });
}

function fmtDateTime(ts: number) {
  return new Date(ts).toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function AgendaBooking() {
  const agenda = useChefeStore((s) => s.agenda);
  const durationMin = useChefeStore((s) => s.profile.serviceDurationMin ?? 30);
  const bookAgenda = useChefeStore((s) => s.bookAgenda);
  const cancelAgenda = useChefeStore((s) => s.cancelAgenda);

  const [saved, setSaved] = useState<SavedBooking | null>(null);
  useEffect(() => setSaved(readSaved()), [agenda.length]);

  const [dayOffset, setDayOffset] = useState(0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);

  const days = useMemo(() => {
    const arr: Date[] = [];
    const base = new Date();
    base.setHours(0, 0, 0, 0);
    for (let i = 0; i < 7; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, []);

  const activeDay = days[dayOffset];

  const slots = useMemo(() => {
    const arr: Date[] = [];
    const now = new Date();
    for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
      for (const m of [0, 30]) {
        const slot = new Date(activeDay);
        slot.setHours(h, m, 0, 0);
        if (slot.getTime() < now.getTime() + 15 * 60 * 1000) continue;
        arr.push(slot);
      }
    }
    return arr;
  }, [activeDay]);

  const takenSet = useMemo(
    () => new Set(agenda.map((a) => Math.floor(a.scheduledAt / 60000))),
    [agenda],
  );

  const submit = async () => {
    if (!name.trim() || !phone.trim() || !selectedSlot) {
      toast.error("Preencha nome, telefone e horário");
      return;
    }
    setBusy(true);
    try {
      const created = await bookAgenda({
        name: name.trim(),
        phone: phone.trim(),
        scheduledAt: selectedSlot,
      });
      if (!created) {
        toast.error("Não foi possível reservar. Tente outro horário.");
        return;
      }
      const rec: SavedBooking = {
        id: created.id,
        name: created.name,
        phone: created.phone ?? phone.trim(),
        scheduledAt: created.scheduledAt,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rec));
      setSaved(rec);
      toast.success("✅ Horário reservado!");
      subscribeToPush(created.name).catch(() => {});
      setSelectedSlot(null);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!saved) return;
    if (!confirm("Cancelar sua reserva?")) return;
    await cancelAgenda(saved.id);
    localStorage.removeItem(STORAGE_KEY);
    setSaved(null);
    toast("Reserva cancelada");
  };

  // Se o cliente já tem reserva ativa, mostra o card de confirmação em vez do calendário
  if (saved && agenda.some((a) => a.id === saved.id)) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-[1.5px]"
        style={{ background: "var(--gradient-ig)" }}
      >
        <div className="rounded-[calc(1.5rem-1.5px)] glass-strong p-5">
          <div className="mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-emerald-300" />
            <p className="text-[11px] font-black uppercase tracking-widest text-emerald-300">
              Seu horário está confirmado
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Cliente</p>
          <p className="text-base font-bold">{saved.name}</p>
          <p className="mt-2 text-xs text-muted-foreground">Marcado para</p>
          <p className="text-lg font-black text-gradient-ig">{fmtDateTime(saved.scheduledAt)}</p>
          <p className="mt-3 text-[11px] leading-snug text-muted-foreground">
            🤖 A IA vai avisar aqui e no seu celular o momento exato de sair pra chegar com 10 min de antecedência,
            usando seu GPS.
          </p>
          <button
            onClick={cancel}
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-3 py-1.5 text-[11px] font-bold text-rose-300 ring-1 ring-rose-400/30"
          >
            <X className="h-3 w-3" /> Cancelar reserva
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-3xl p-5"
    >
      <div className="mb-3 flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-sky-300" />
        <p className="text-[11px] font-black uppercase tracking-widest text-sky-300">
          Agendar horário · {durationMin}min por corte
        </p>
      </div>

      {/* Day selector */}
      <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
        {days.map((d, i) => {
          const active = i === dayOffset;
          return (
            <button
              key={i}
              onClick={() => {
                setDayOffset(i);
                setSelectedSlot(null);
              }}
              className={`shrink-0 rounded-2xl px-3 py-2 text-[11px] font-bold capitalize transition ${
                active
                  ? "bg-gradient-ig text-white shadow-lg"
                  : "bg-white/[0.04] text-muted-foreground ring-1 ring-white/10"
              }`}
            >
              {i === 0 ? "Hoje" : fmtDay(d)}
            </button>
          );
        })}
      </div>

      {/* Slots */}
      {slots.length === 0 ? (
        <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
          Sem horários disponíveis neste dia.
        </p>
      ) : (
        <div className="grid grid-cols-4 gap-2">
          {slots.map((s) => {
            const key = Math.floor(s.getTime() / 60000);
            const taken = takenSet.has(key);
            const active = selectedSlot?.getTime() === s.getTime();
            return (
              <button
                key={key}
                disabled={taken}
                onClick={() => setSelectedSlot(s)}
                className={`relative flex items-center justify-center rounded-xl py-2 text-xs font-bold tabular-nums transition ${
                  taken
                    ? "bg-white/[0.02] text-muted-foreground/40 line-through"
                    : active
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/40"
                      : "bg-white/[0.05] text-white ring-1 ring-white/10 hover:ring-sky-400/40"
                }`}
              >
                {s.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                {active && <Check className="absolute right-1 top-1 h-3 w-3" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Contact */}
      <div className="mt-4 space-y-2">
        <input
          placeholder="Seu nome"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-muted-foreground focus:ring-sky-400/50"
        />
        <input
          placeholder="WhatsApp (com DDD)"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-white ring-1 ring-white/10 outline-none placeholder:text-muted-foreground focus:ring-sky-400/50"
        />
      </div>

      <button
        onClick={submit}
        disabled={busy || !selectedSlot}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white disabled:opacity-50"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
        {selectedSlot
          ? `Reservar ${selectedSlot.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
          : "Escolha um horário"}
      </button>
    </motion.div>
  );
}