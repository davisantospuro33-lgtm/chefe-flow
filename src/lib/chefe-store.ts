import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export type ChefeStatus = "available" | "busy" | "break" | "closed";
export type Stage = 0 | 1 | 2 | 3;

export interface QueueClient {
  id: string;
  name: string;
  phone?: string | null;
  addedAt: number;
  qtd?: number | null;
  referencia?: string | null;
  perfil?: string | null;
  position?: number;
}

export interface PendingRequest {
  id: string;
  name: string;
  phone: string;
  referencia: string;
  perfil: string;
  qtd: number;
  createdAt: number;
}

export interface ChefeProfile {
  username: string;
  bio: string;
  avatarUrl: string | null;
  cutsCount: string;
  rating: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  position: number;
}

export interface PortfolioItem {
  id: string;
  storagePath: string;
  url: string;
  position: number;
  createdAt: number;
}

interface ChefeState {
  status: ChefeStatus;
  currentClientId: string | null;
  stage: Stage;
  queue: QueueClient[];
  distanceKm: number;
  extraMinutes: number;
  presencialCount: number;
  pendentes: PendingRequest[];
  profile: ChefeProfile;
  reviews: Review[];
  portfolio: PortfolioItem[];
  hydrated: boolean;
  setStatus: (s: ChefeStatus) => Promise<void>;
  addClient: (name: string, phone?: string) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  addSolicitacao: (r: Omit<PendingRequest, "id" | "createdAt">) => Promise<void>;
  aceitarPendente: (id: string) => Promise<void>;
  recusarPendente: (id: string) => Promise<void>;
  startCut: () => Promise<void>;
  completeAndNext: () => Promise<void>;
  setStage: (s: Stage) => Promise<void>;
  addTenMinutes: () => Promise<void>;
  setDistance: (km: number) => void;
  incPresencial: () => Promise<void>;
  decPresencial: () => Promise<void>;
  resetDemo: () => Promise<void>;
  updateProfile: (patch: Partial<ChefeProfile>) => Promise<void>;
  saveReview: (r: Omit<Review, "id"> & { id?: string }) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
  uploadPortfolio: (file: File) => Promise<void>;
  deletePortfolio: (id: string, storagePath: string) => Promise<void>;
  hydrate: () => Promise<void>;
  subscribe: () => () => void;
}

type QueueRow = {
  id: string;
  name: string;
  phone: string | null;
  qtd: number | null;
  referencia: string | null;
  perfil: string | null;
  added_at: string;
  position: number;
};

type PendenteRow = {
  id: string;
  name: string;
  phone: string;
  referencia: string;
  perfil: string;
  qtd: number;
  created_at: string;
};

function mapQueue(r: QueueRow): QueueClient {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    qtd: r.qtd,
    referencia: r.referencia,
    perfil: r.perfil,
    addedAt: new Date(r.added_at).getTime(),
    position: r.position,
  };
}

function mapPendente(r: PendenteRow): PendingRequest {
  return {
    id: r.id,
    name: r.name,
    phone: r.phone,
    referencia: r.referencia,
    perfil: r.perfil,
    qtd: r.qtd,
    createdAt: new Date(r.created_at).getTime(),
  };
}

type StatePatch = {
  status?: string;
  presencial_count?: number;
  extra_minutes?: number;
  stage?: number;
  current_client_id?: string | null;
};
async function updateState(patch: StatePatch) {
  await supabase.from("chefe_state").update(patch).eq("id", 1);
}

export const useChefeStore = create<ChefeState>()((set, get) => ({
  status: "available",
  currentClientId: null,
  stage: 1,
  queue: [],
  distanceKm: 2.4,
  extraMinutes: 0,
  presencialCount: 0,
  pendentes: [],
  profile: {
    username: "@chefe.oficial",
    bio: "Barbeiro · Cortes autorais",
    avatarUrl: null,
    cutsCount: "1.2k",
    rating: "4.9",
  },
  reviews: [],
  portfolio: [],
  hydrated: false,

  hydrate: async () => {
    const [{ data: queue }, { data: pendentes }, { data: state }, { data: profile }, { data: reviews }, { data: portfolio }] = await Promise.all([
      supabase.from("chefe_queue").select("*").order("position").order("added_at"),
      supabase.from("chefe_pendentes").select("*").order("created_at"),
      supabase.from("chefe_state").select("*").eq("id", 1).maybeSingle(),
      supabase.from("chefe_profile").select("*").eq("id", 1).maybeSingle(),
      supabase.from("chefe_reviews").select("*").order("position").order("created_at"),
      supabase.from("chefe_portfolio").select("*").order("position").order("created_at"),
    ]);
    set({
      queue: (queue ?? []).map((r) => mapQueue(r as QueueRow)),
      pendentes: (pendentes ?? []).map((r) => mapPendente(r as PendenteRow)),
      status: (state?.status as ChefeStatus) ?? "available",
      presencialCount: state?.presencial_count ?? 0,
      extraMinutes: state?.extra_minutes ?? 0,
      stage: (state?.stage as Stage) ?? 1,
      currentClientId: state?.current_client_id ?? null,
      profile: {
        username: profile?.username ?? "@chefe.oficial",
        bio: profile?.bio ?? "Barbeiro · Cortes autorais",
        avatarUrl: profile?.avatar_url ?? null,
        cutsCount: profile?.cuts_count ?? "1.2k",
        rating: profile?.rating ?? "4.9",
      },
      reviews: (reviews ?? []).map((r) => ({
        id: r.id,
        name: r.name,
        rating: Number(r.rating),
        comment: r.comment,
        position: r.position,
      })),
      portfolio: (portfolio ?? []).map((r) => ({
        id: r.id,
        storagePath: r.storage_path,
        url: r.url,
        position: r.position,
        createdAt: new Date(r.created_at).getTime(),
      })),
      hydrated: true,
    });
  },

  subscribe: () => {
    const refresh = () => get().hydrate();
    const ch = supabase
      .channel("chefe-sync")
      .on("postgres_changes", { event: "*", schema: "public", table: "chefe_queue" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "chefe_pendentes" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "chefe_state" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "chefe_profile" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "chefe_reviews" }, refresh)
      .on("postgres_changes", { event: "*", schema: "public", table: "chefe_portfolio" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  },

  updateProfile: async (patch) => {
    const dbPatch: Record<string, unknown> = {};
    if (patch.username !== undefined) dbPatch.username = patch.username;
    if (patch.bio !== undefined) dbPatch.bio = patch.bio;
    if (patch.avatarUrl !== undefined) dbPatch.avatar_url = patch.avatarUrl;
    if (patch.cutsCount !== undefined) dbPatch.cuts_count = patch.cutsCount;
    if (patch.rating !== undefined) dbPatch.rating = patch.rating;
    dbPatch.updated_at = new Date().toISOString();
    await supabase.from("chefe_profile").update(dbPatch).eq("id", 1);
    await get().hydrate();
  },

  saveReview: async (r) => {
    if (r.id) {
      await supabase
        .from("chefe_reviews")
        .update({ name: r.name, rating: r.rating, comment: r.comment, position: r.position })
        .eq("id", r.id);
    } else {
      await supabase
        .from("chefe_reviews")
        .insert({ name: r.name, rating: r.rating, comment: r.comment, position: r.position });
    }
    await get().hydrate();
  },

  deleteReview: async (id) => {
    await supabase.from("chefe_reviews").delete().eq("id", id);
    await get().hydrate();
  },

  uploadPortfolio: async (file) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `portfolio/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("chefe-media")
      .upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
    if (upErr) throw upErr;
    const { data: signed } = await supabase.storage
      .from("chefe-media")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    const url = signed?.signedUrl ?? "";
    const nextPos = (get().portfolio[get().portfolio.length - 1]?.position ?? 0) + 1;
    await supabase.from("chefe_portfolio").insert({ storage_path: path, url, position: nextPos });
    await get().hydrate();
  },

  deletePortfolio: async (id, storagePath) => {
    await supabase.storage.from("chefe-media").remove([storagePath]);
    await supabase.from("chefe_portfolio").delete().eq("id", id);
    await get().hydrate();
  },

  setStatus: async (status) => {
    set({ status });
    await updateState({ status });
  },

  addClient: async (name, phone) => {
    const nextPos = (get().queue[get().queue.length - 1]?.position ?? 0) + 1;
    await supabase.from("chefe_queue").insert({ name, phone, position: nextPos });
    await get().hydrate();
  },

  removeClient: async (id) => {
    await supabase.from("chefe_queue").delete().eq("id", id);
    await get().hydrate();
  },

  addSolicitacao: async (r) => {
    await supabase.from("chefe_pendentes").insert(r);
    await get().hydrate();
  },

  aceitarPendente: async (id) => {
    const p = get().pendentes.find((x) => x.id === id);
    if (!p) return;
    const nextPos = (get().queue[get().queue.length - 1]?.position ?? 0) + 1;
    await supabase.from("chefe_queue").insert({
      name: p.name,
      phone: p.phone,
      qtd: p.qtd,
      referencia: p.referencia,
      perfil: p.perfil,
      position: nextPos,
    });
    await supabase.from("chefe_pendentes").delete().eq("id", id);
    await get().hydrate();
  },

  recusarPendente: async (id) => {
    await supabase.from("chefe_pendentes").delete().eq("id", id);
    await get().hydrate();
  },

  startCut: async () => {
    const current = get().queue[0];
    set({ stage: 2, currentClientId: current?.id ?? null, status: "busy" });
    await updateState({
      stage: 2,
      current_client_id: current?.id ?? null,
      status: "busy",
    });
  },

  completeAndNext: async () => {
    const first = get().queue[0];
    if (first) await supabase.from("chefe_queue").delete().eq("id", first.id);
    const rest = get().queue.slice(1);
    const next = rest[0];
    const newStage: Stage = rest.length > 0 ? 1 : 3;
    const newStatus: ChefeStatus = rest.length > 0 ? "busy" : "available";
    await updateState({
      stage: newStage,
      status: newStatus,
      current_client_id: next?.id ?? null,
    });
    await get().hydrate();
  },

  setStage: async (stage) => {
    set({ stage });
    await updateState({ stage });
  },

  addTenMinutes: async () => {
    const extraMinutes = get().extraMinutes + 10;
    set({ extraMinutes });
    await updateState({ extra_minutes: extraMinutes });
  },

  setDistance: (km) => set({ distanceKm: km }),

  incPresencial: async () => {
    const presencialCount = get().presencialCount + 1;
    set({ presencialCount });
    await updateState({ presencial_count: presencialCount });
  },

  decPresencial: async () => {
    const presencialCount = Math.max(0, get().presencialCount - 1);
    set({ presencialCount });
    await updateState({ presencial_count: presencialCount });
  },

  resetDemo: async () => {
    await Promise.all([
      supabase.from("chefe_queue").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
      supabase.from("chefe_pendentes").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);
    await updateState({
      status: "available",
      stage: 1,
      extra_minutes: 0,
      current_client_id: null,
      presencial_count: 0,
    });
    await get().hydrate();
  },
}));

export const statusMeta: Record<ChefeStatus, { label: string; emoji: string; dot: string }> = {
  available: { label: "Disponível", emoji: "🟢", dot: "bg-neon" },
  busy: { label: "Atendendo", emoji: "🔴", dot: "bg-destructive" },
  break: { label: "Pausa", emoji: "☕", dot: "bg-ig-orange" },
  closed: { label: "Fechado", emoji: "🏠", dot: "bg-muted-foreground" },
};