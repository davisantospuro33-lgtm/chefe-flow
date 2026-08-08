import { useEffect, useMemo, useState } from "react";
import { useChefeStore } from "@/lib/chefe-store";

/**
 * ENGRENAGEM OPERACIONAL ÚNICA
 * Fonte de verdade compartilhada por Agenda, Encaixe Virtual, Fila Presencial e Status.
 *
 * Todas as regras derivam do SERVIÇO PRINCIPAL (profile):
 *  - serviceDurationMin  -> duração real do corte
 *  - serviceBufferMin    -> margem operacional entre clientes (somada UMA vez)
 *  - serviceOpenHour / serviceCloseHour -> expediente
 *  - serviceDays         -> dias de funcionamento (0=dom ... 6=sáb)
 *
 * Atrasos (+10/+20) do Painel entram como margem temporária (extraMinutes),
 * nunca como nova duração do serviço.
 */
export function useSchedule() {
  const profile = useChefeStore((s) => s.profile);
  const status = useChefeStore((s) => s.status);
  const stage = useChefeStore((s) => s.stage);
  const agenda = useChefeStore((s) => s.agenda);
  const queue = useChefeStore((s) => s.queue);
  const pendentes = useChefeStore((s) => s.pendentes);
  const presencial = useChefeStore((s) => s.presencialCount);
  const extraMinutes = useChefeStore((s) => s.extraMinutes);

  const durationMin = profile.serviceDurationMin;
  const bufferMin = profile.serviceBufferMin ?? 0;
  const openHour = profile.serviceOpenHour ?? 9;
  const closeHour = profile.serviceCloseHour ?? 20;
  const days = profile.serviceDays?.length ? profile.serviceDays : [0, 1, 2, 3, 4, 5, 6];
  const daysKey = days.join(",");

  // capacidade real ocupada por atendimento
  const slotMin = durationMin + bufferMin;

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Atendimento em andamento ocupa capacidade imediata
  const inProgress = stage >= 2 || status === "busy";

  const isWorkingDay = useMemo(() => {
    const set = new Set(daysKey.split(",").map(Number));
    return (d: Date) => set.has(d.getDay());
  }, [daysKey]);

  /** Fila que ocupa capacidade agora: presencial + encaixes liberados + atendimento em curso */
  const activeAhead = presencial + queue.length + (inProgress ? 1 : 0);

  /** Espera do Encaixe Virtual (pedidos ainda não liberados não contam) */
  const waitMinutes = useMemo(
    () => activeAhead * slotMin + extraMinutes,
    [activeAhead, slotMin, extraMinutes],
  );

  /** Carga projetada da Agenda: inclui pedidos recebidos aguardando liberação */
  const loadMinutes = useMemo(
    () => (activeAhead + pendentes.length) * slotMin + extraMinutes,
    [activeAhead, pendentes.length, slotMin, extraMinutes],
  );

  /** Previsão (min) de quem está na posição `index` da fila virtual (0-based) */
  const etaForIndex = useMemo(
    () => (index: number) =>
      (presencial + (inProgress ? 1 : 0) + index) * slotMin + extraMinutes,
    [presencial, inProgress, slotMin, extraMinutes],
  );

  const earliestStart = useMemo(() => now + loadMinutes * 60_000, [now, loadMinutes]);

  const isTaken = useMemo(() => {
    const block = slotMin * 60_000;
    return (start: number) =>
      agenda.some((a) => start < a.scheduledAt + block && a.scheduledAt < start + block);
  }, [agenda, slotMin]);

  /** Gera os horários do dia: expediente + duração real + estado operacional */
  const slotsForDay = useMemo(
    () => (day: Date) => {
      if (!isWorkingDay(day)) return [] as Date[];
      const start = new Date(day);
      start.setHours(openHour, 0, 0, 0);
      const end = new Date(day);
      end.setHours(closeHour, 0, 0, 0);
      const arr: Date[] = [];
      for (
        let t = start.getTime();
        t + durationMin * 60_000 <= end.getTime();
        t += slotMin * 60_000
      ) {
        if (t < earliestStart) continue;
        arr.push(new Date(t));
      }
      return arr;
    },
    [isWorkingDay, openHour, closeHour, durationMin, slotMin, earliestStart],
  );

  const nextFree = useMemo(() => {
    const base = new Date(earliestStart);
    for (let d = 0; d < 14; d++) {
      const day = new Date(base);
      day.setDate(base.getDate() + d);
      for (const s of slotsForDay(day)) {
        if (!isTaken(s.getTime())) return s.getTime();
      }
    }
    return null;
  }, [earliestStart, slotsForDay, isTaken]);

  return {
    now,
    durationMin,
    bufferMin,
    slotMin,
    openHour,
    closeHour,
    days,
    isWorkingDay,
    slotsForDay,
    inProgress,
    queue,
    pendentes,
    presencial,
    extraMinutes,
    activeAhead,
    waitMinutes,
    loadMinutes,
    etaForIndex,
    earliestStart,
    isTaken,
    nextFree,
  };
}
