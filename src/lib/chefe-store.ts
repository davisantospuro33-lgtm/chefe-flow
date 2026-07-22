import { create } from "zustand";

export interface QueueItem {
  id: string;
  name: string;
  joinedAt: string;
}

export type SalonStatus = "open" | "busy" | "break" | "closed";

interface Profile {
  username: string;
  bio: string;
  avatarUrl: string;
  cutsCount: string;
  rating: string;
}

interface ChefeState {
  // Estado do Salão Espelhado
  status: SalonStatus;
  setStatus: (status: SalonStatus) => void;
  
  // Perfil do Barbeiro
  profile: Profile;
  setProfile: (profile: Partial<Profile>) => void;

  // Fila Virtual & Sofá
  queue: QueueItem[];
  presencialCount: number;
  
  // Ações do Painel (Que espelham pro Cliente)
  addToQueue: (name: string) => void;
  removeFromQueue: (id: string) => void;
  nextInQueue: () => void;
  incrementPresencial: () => void;
  decrementPresencial: () => void;
  clearQueue: () => void;
  
  // Cálculo do TIC-TAC do Relógio (40min por cliente)
  getTempoEsperaTotal: () => number;
}

export const useChefeStore = create<ChefeState>((set, get) => ({
  status: "open",
  setStatus: (status) => set({ status }),

  profile: {
    username: "Comando CHEFE",
    bio: "Barbearia de Alto Padrão · Atendimento Direto",
    avatarUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80",
    cutsCount: "1.2k+",
    rating: "4.9",
  },
  setProfile: (newProfile) =>
    set((state) => ({ profile: { ...state.profile, ...newProfile } })),

  queue: [],
  presencialCount: 0,

  // Adicionar cliente na fila virtual
  addToQueue: (name) =>
    set((state) => {
      const newItem: QueueItem = {
        id: Date.now().toString(),
        name,
        joinedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      return { queue: [...state.queue, newItem] };
    }),

  // Remover cliente específico
  removeFromQueue: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),

  // Chamou o próximo no Painel do Barbeiro
  nextInQueue: () =>
    set((state) => {
      if (state.queue.length === 0) return state;
      const [_, ...rest] = state.queue;
      return { queue: rest };
    }),

  // Alterar presencial no balcão/sofá
  incrementPresencial: () =>
    set((state) => ({ presencialCount: state.presencialCount + 1 })),

  decrementPresencial: () =>
    set((state) => ({
      presencialCount: Math.max(0, state.presencialCount - 1),
    })),

  // Zerar tudo
  clearQueue: () => set({ queue: [], presencialCount: 0 }),

  // CÉREBRO DE CÁLCULO DE TEMPO DO RELÓGIO (40 minutos cravados por atendimento)
  getTempoEsperaTotal: () => {
    const { queue, presencialCount } = get();
    const totalPessoas = queue.length + presencialCount;
    return totalPessoas * 40;
  },
}));
