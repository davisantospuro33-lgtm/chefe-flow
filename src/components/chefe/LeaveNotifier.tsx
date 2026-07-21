import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { AlarmClock } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { toast } from "sonner";

const STORAGE_KEY = "chefe.myBooking";

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function LeaveNotifier() {
  const agenda = useChefeStore((s) => s.agenda);
  const salonLat = useChefeStore((s) => s.profile.latitude ?? s.latitude);
  const salonLng = useChefeStore((s) => s.profile.longitude ?? s.longitude);
  const extra = useChefeStore((s) => s.extraMinutes);
  const distanceKm = useChefeStore((s) => s.distanceKm);
  const markNotified = useChefeStore((s) => s.markAgendaNotified);

  const [savedId, setSavedId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const alerted = useRef(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSavedId((JSON.parse(raw) as { id: string }).id);
    } catch {
      // ignore
    }
  }, [agenda.length]);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(t);
  }, []);

  const booking = savedId ? agenda.find((a) => a.id === savedId) : null;
  if (!booking || !salonLat || !salonLng) return null;

  // Compute travel time (same rule as AIAlertBox): ~3min/km + extra fila. +10min de antecedência
  const travelMin = Math.max(3, Math.round(distanceKm * 3) + extra);
  const BUFFER_MIN = 10;
  const leaveAt = booking.scheduledAt - (travelMin + BUFFER_MIN) * 60_000;
  const minutesUntilLeave = Math.round((leaveAt - now) / 60_000);
  const minutesUntilAppointment = Math.round((booking.scheduledAt - now) / 60_000);

  // Dispara alerta quando é hora de sair
  useEffect(() => {
    if (!booking) return;
    if (booking.notifiedLeave) return;
    if (alerted.current) return;
    if (now >= leaveAt && now < booking.scheduledAt) {
      alerted.current = true;
      toast.success("🚨 HORA DE SAIR! Bora pro CHEFE.", { duration: 15000 });
      // Push local via Service Worker se disponível
      if ("Notification" in window && Notification.permission === "granted") {
        navigator.serviceWorker?.getRegistration().then((reg) => {
          reg?.showNotification("🚨 HORA DE SAIR — CHEFE", {
            body: `Saia agora pra chegar 10 min antes do seu horário (${new Date(
              booking.scheduledAt,
            ).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}).`,
            icon: "/icon-192.png",
            tag: "chefe-leave",
          });
        });
      }
      markNotified(booking.id).catch(() => {});
    }
  }, [now, leaveAt, booking, markNotified]);

  if (minutesUntilAppointment < -30) return null;

  const isLeaveTime = now >= leaveAt && now < booking.scheduledAt;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl p-[1.5px]"
      style={{
        background: isLeaveTime
          ? "linear-gradient(135deg,#f97316,#ef4444)"
          : "linear-gradient(135deg,rgba(56,189,248,0.6),rgba(30,58,138,0.6))",
      }}
    >
      <div className="rounded-[calc(1.5rem-1.5px)] glass-strong p-4">
        <div className="flex items-center gap-2">
          <AlarmClock className={`h-4 w-4 ${isLeaveTime ? "text-orange-300" : "text-sky-300"}`} />
          <p
            className={`text-[11px] font-black uppercase tracking-widest ${
              isLeaveTime ? "text-orange-300" : "text-sky-300"
            }`}
          >
            {isLeaveTime ? "🚨 Hora de sair — agora!" : "Sua reserva ativa"}
          </p>
        </div>
        <p className="mt-2 text-sm leading-snug text-white">
          Horário: <span className="font-black">
            {new Date(booking.scheduledAt).toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>{" "}
          · trajeto GPS <span className="font-black">{travelMin} min</span> + 10 min de antecedência
        </p>
        <p className={`mt-1 text-xs ${isLeaveTime ? "text-orange-200" : "text-muted-foreground"}`}>
          {isLeaveTime
            ? "Sai agora pra chegar com folga."
            : minutesUntilLeave > 0
              ? `Saia em ${minutesUntilLeave} min.`
              : "Você já deveria estar a caminho."}
        </p>
      </div>
    </motion.div>
  );
}