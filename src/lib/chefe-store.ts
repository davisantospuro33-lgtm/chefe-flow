import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ChefeStatus = "available" | "busy" | "break" | "closed";
export type Stage = 0 | 1 | 2 | 3; // Fila | Sair | Cadeira | Concluído

export interface QueueClient {
  id: string;
  name: string;
  phone?: string;
  addedAt: number;
}

interface ChefeState {
  status: ChefeStatus;
  currentClientId: string | null;
  stage: Stage;
  queue: QueueClient[];
  distanceKm: number;
  extraMinutes: number;
  presencialCount: number;
  setStatus: (s: ChefeStatus) => void;
  addClient: (name: string, phone?: string) => void;
  removeClient: (id: string) => void;
  startCut: () => void;
  completeAndNext: () => void;
  setStage: (s: Stage) => void;
  addTenMinutes: () => void;
  setDistance: (km: number) => void;
  incPresencial: () => void;
  decPresencial: () => void;
  resetDemo: () => void;
}

const seed: QueueClient[] = [
  { id: "1", name: "Você (Rafa)", addedAt: Date.now() - 60_000 * 5 },
  { id: "2", name: "Lucas M.", addedAt: Date.now() },
  { id: "3", name: "Pedro A.", addedAt: Date.now() + 60_000 },
];

export const useChefeStore = create<ChefeState>()(
  persist(
    (set) => ({
      status: "available",
      currentClientId: null,
      stage: 1,
      queue: seed,
      distanceKm: 2.4,
      extraMinutes: 0,
      presencialCount: 0,
      setStatus: (status) => set({ status }),
      addClient: (name, phone) =>
        set((s) => ({
          queue: [...s.queue, { id: crypto.randomUUID(), name, phone, addedAt: Date.now() }],
        })),
      removeClient: (id) =>
        set((s) => ({ queue: s.queue.filter((c) => c.id !== id) })),
      startCut: () =>
        set((s) => ({
          stage: 2,
          currentClientId: s.queue[0]?.id ?? null,
          status: "busy",
        })),
      completeAndNext: () =>
        set((s) => {
          const rest = s.queue.slice(1);
          return {
            queue: rest,
            currentClientId: rest[0]?.id ?? null,
            stage: rest.length > 0 ? 1 : 3,
            status: rest.length > 0 ? "busy" : "available",
          };
        }),
      setStage: (stage) => set({ stage }),
      addTenMinutes: () => set((s) => ({ extraMinutes: s.extraMinutes + 10 })),
      setDistance: (km) => set({ distanceKm: km }),
      incPresencial: () => set((s) => ({ presencialCount: s.presencialCount + 1 })),
      decPresencial: () =>
        set((s) => ({ presencialCount: Math.max(0, s.presencialCount - 1) })),
      resetDemo: () =>
        set({
          status: "available",
          stage: 1,
          queue: seed,
          extraMinutes: 0,
          currentClientId: null,
          presencialCount: 0,
        }),
    }),
    { name: "chefe-store-v1" },
  ),
);

export const statusMeta: Record<ChefeStatus, { label: string; emoji: string; dot: string }> = {
  available: { label: "Disponível", emoji: "🟢", dot: "bg-neon" },
  busy: { label: "Atendendo", emoji: "🔴", dot: "bg-destructive" },
  break: { label: "Pausa", emoji: "☕", dot: "bg-ig-orange" },
  closed: { label: "Fechado", emoji: "🏠", dot: "bg-muted-foreground" },
};