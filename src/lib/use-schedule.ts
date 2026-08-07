import { useEffect, useMemo, useState } from "react";
import { useChefeStore } from "@/lib/chefe-store";

export const OPEN_HOUR = 9;
export const CLOSE_HOUR = 20;

/**
 * Fonte ÚNICA de tempo da Agenda + Encaixe Virtual.
 * Duração vem exclusivamente de profile.serviceDurationMin.
 * Recalcula em tempo real (relógio interno + estado global do painel).
 */
export function useSchedule() {
  const durationMin = useChefeStore((s) => s.profile.serviceDurationMin);
  const agenda = useChefeStore((s) => s.agenda);
  const queue = useChefeStore((s) => s.queue);
  const pendentes = useChefeStore((s) => s.pendentes);
  const presencial = useChefeStore((s) => s.presencialCount);
  const extraMinutes = useChefeStore((s) => s.extraMinutes);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Tempo de espera do Encaixe Virtual (fila + presenciais + atrasos do painel)
  const waitMinutes = useMemo(
    () => (queue.length + presencial) * durationMin + extraMinutes,
    [queue.length, presencial, durationMin, extraMinutes],
  );

  // Carga total considerada pela Agenda (inclui pedidos pendentes)
  const loadMinutes = useMemo(
    () => (queue.length + presencial + pendentes.length) * durationMin + extraMinutes,
    [queue.length, presencial, pendentes.length, durationMin, extraMinutes],
  );

  const earliestStart = useMemo(
    () => now + (loadMinutes + 15) * 60_000,
    [now, loadMinutes],
  );

  const isTaken = useMemo(() => {
    const dur = durationMin * 60_000;
    return (start: number) =>
      agenda.some((a) => start < a.scheduledAt + dur && a.scheduledAt < start + dur);
  }, [agenda, durationMin]);

  const nextFree = useMemo(() => {
    const base = new Date(earliestStart);
    for (let d = 0; d < 7; d++) {
      const day = new Date(base);
      day.setDate(base.getDate() + d);
      const start = new Date(day);
      start.setHours(OPEN_HOUR, 0, 0, 0);
      const end = new Date(day);
      end.setHours(CLOSE_HOUR, 0, 0, 0);
      for (
        let t = start.getTime();
        t + durationMin * 60_000 <= end.getTime();
        t += durationMin * 60_000
      ) {
        if (t < earliestStart) continue;
        if (!isTaken(t)) return t;
      }
    }
    return null;
  }, [earliestStart, durationMin, isTaken]);

  return {
    now,
    durationMin,
    queue,
    pendentes,
    presencial,
    extraMinutes,
    waitMinutes,
    loadMinutes,
    earliestStart,
    isTaken,
    nextFree,
  };
}
