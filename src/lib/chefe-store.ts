import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";

export type ChefeStatus = "available" | "busy" | "break" | "closed";

export interface QueueClient {
  id: string;
  name: string;
  phone: string | null;
  position: number;
}

export interface Pendente {
  id: string;
  name: string;
  phone: string;
  referencia: string;
  perfil: string;
  qtd: number;
}

export interface AgendaItem {
  id: string;
  name: string;
  phone: string | null;
  scheduledAt: number;
  status: string;
  notifiedLeave: boolean;
}

export interface PortfolioItem {
  id: string;
  url: string;
  mediaType: "image" | "video";
  storagePath: string;
  position: number;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  comment: string;
  position: number;
}

export interface Profile {
  username: string;
  bio: string;
  avatarUrl: string | null;
  cutsCount: string;
  rating: string;
  phoneOfficial: string | null;
  latitude: number | null;
  longitude: number | null;
  servicePrice: string;
  serviceDurationMin: number;
  aiGreeting: string;
}

const DEFAULT_PROFILE: Profile = {
  username: "Comando CHEFE",
  bio: "Barbearia de Alto Padrão · Atendimento Direto",
  avatarUrl:
    "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400&auto=format&fit=crop&q=80",
  cutsCount: "1.2k+",
  rating: "4.9",
  phoneOfficial: null,
  latitude: -23.68735,
  longitude: -46.50292,
  servicePrice: "R$ 25,00",
  serviceDurationMin: 40,
  aiGreeting:
    "Salve! Aqui é a Atendente do CHEFE. Como posso te ajudar hoje?",
};

interface ChefeState {
  // Estado global
  status: ChefeStatus;
  stage: number;
  extraMinutes: number;
  presencialCount: number;
  pessoasNoSalao: number;
  instrucoesDoChefe: string;

  // Localização
  distanceKm: number;
  latitude: number | null;
  longitude: number | null;
  endereco: string;

  // Dados
  profile: Profile;
  queue: QueueClient[];
  agenda: AgendaItem[];
  pendentes: Pendente[];
  portfolio: PortfolioItem[];
  reviews: Review[];

  // Setters / actions
  setStatus: (s: ChefeStatus) => Promise<void>;
  setDistance: (km: number) => void;
  setPessoasNoSalao: (n: number) => Promise<void>;

  incPresencial: () => Promise<void>;
  decPresencial: () => Promise<void>;

  startCut: () => Promise<void>;
  completeAndNext: () => Promise<void>;
  addTenMinutes: () => Promise<void>;
  resetDemo: () => Promise<void>;

  addToQueue: (name: string, phone?: string) => Promise<void>;
  removeClient: (id: string) => Promise<void>;
  reorderQueue: (ids: string[]) => Promise<void>;

  aceitarPendente: (id: string) => Promise<void>;
  recusarPendente: (id: string) => Promise<void>;

  bookAgenda: (input: {
    name: string;
    phone: string;
    scheduledAt: Date;
  }) => Promise<AgendaItem | null>;
  cancelAgenda: (id: string) => Promise<void>;
  markAgendaNotified: (id: string) => Promise<void>;

  updateProfile: (patch: Partial<Profile>) => Promise<void>;

  saveReview: (r: Omit<Review, "id"> & { id?: string }) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;

  uploadPortfolio: (file: File) => Promise<void>;
  deletePortfolio: (id: string, storagePath: string) => Promise<void>;

  hydrate: () => Promise<void>;
  subscribe: () => () => void;
}

function mapQueue(row: {
  id: string;
  name: string;
  phone: string | null;
  position: number;
}): QueueClient {
  return { id: row.id, name: row.name, phone: row.phone, position: row.position };
}

function mapAgenda(row: {
  id: string;
  name: string;
  phone: string | null;
  scheduled_at: string;
  status: string;
  notified_leave: boolean;
}): AgendaItem {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    scheduledAt: new Date(row.scheduled_at).getTime(),
    status: row.status,
    notifiedLeave: row.notified_leave,
  };
}

function mapPortfolio(row: {
  id: string;
  url: string;
  media_type: string;
  storage_path: string;
  position: number;
}): PortfolioItem {
  return {
    id: row.id,
    url: row.url,
    mediaType: row.media_type === "video" ? "video" : "image",
    storagePath: row.storage_path,
    position: row.position,
  };
}

function mapProfile(row: Record<string, unknown> | null): Profile {
  if (!row) return DEFAULT_PROFILE;
  return {
    username: (row.username as string) ?? DEFAULT_PROFILE.username,
    bio: (row.bio as string) ?? DEFAULT_PROFILE.bio,
    avatarUrl: (row.avatar_url as string | null) ?? DEFAULT_PROFILE.avatarUrl,
    cutsCount: (row.cuts_count as string) ?? DEFAULT_PROFILE.cutsCount,
    rating: (row.rating as string) ?? DEFAULT_PROFILE.rating,
    phoneOfficial: (row.phone_official as string | null) ?? null,
    latitude: (row.latitude as number | null) ?? DEFAULT_PROFILE.latitude,
    longitude: (row.longitude as number | null) ?? DEFAULT_PROFILE.longitude,
    servicePrice: (row.service_price as string) ?? DEFAULT_PROFILE.servicePrice,
    serviceDurationMin:
      (row.service_duration_min as number) ?? DEFAULT_PROFILE.serviceDurationMin,
    aiGreeting: (row.ai_greeting as string) ?? DEFAULT_PROFILE.aiGreeting,
  };
}

function profilePatchToRow(p: Partial<Profile>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (p.username !== undefined) out.username = p.username;
  if (p.bio !== undefined) out.bio = p.bio;
  if (p.avatarUrl !== undefined) out.avatar_url = p.avatarUrl;
  if (p.cutsCount !== undefined) out.cuts_count = p.cutsCount;
  if (p.rating !== undefined) out.rating = p.rating;
  if (p.phoneOfficial !== undefined) out.phone_official = p.phoneOfficial;
  if (p.latitude !== undefined) out.latitude = p.latitude;
  if (p.longitude !== undefined) out.longitude = p.longitude;
  if (p.servicePrice !== undefined) out.service_price = p.servicePrice;
  if (p.serviceDurationMin !== undefined)
    out.service_duration_min = p.serviceDurationMin;
  if (p.aiGreeting !== undefined) out.ai_greeting = p.aiGreeting;
  return out;
}

export const useChefeStore = create<ChefeState>((set, get) => ({
  status: "available",
  stage: 0,
  extraMinutes: 0,
  presencialCount: 0,
  pessoasNoSalao: 0,
  instrucoesDoChefe: "",

  distanceKm: 0,
  latitude: null,
  longitude: null,
  endereco:
    "Rua Renato Russo, 100 - Bloco 7, AP 16 - CDHU / Jardim Santo André, Santo André - SP",

  profile: DEFAULT_PROFILE,
  queue: [],
  agenda: [],
  pendentes: [],
  portfolio: [],
  reviews: [],

  setStatus: async (s) => {
    set({ status: s });
    await supabase.from("chefe_state").update({ status: s }).eq("id", 1);
  },

  setDistance: (km) => set({ distanceKm: km }),

  setPessoasNoSalao: async (n) => {
    const val = Math.max(0, n);
    set({ pessoasNoSalao: val });
    await supabase
      .from("chefe_status_salao")
      .upsert({ id: 1, pessoas_no_salao: val });
  },

  incPresencial: async () => {
    const next = get().presencialCount + 1;
    set({ presencialCount: next });
    await supabase.from("chefe_state").update({ presencial_count: next }).eq("id", 1);
  },
  decPresencial: async () => {
    const next = Math.max(0, get().presencialCount - 1);
    set({ presencialCount: next });
    await supabase.from("chefe_state").update({ presencial_count: next }).eq("id", 1);
  },

  startCut: async () => {
    const next = Math.max(get().stage, 2);
    set({ stage: next });
    await supabase.from("chefe_state").update({ stage: next }).eq("id", 1);
  },
  completeAndNext: async () => {
    const q = get().queue;
    if (q.length > 0) {
      await supabase.from("chefe_queue").delete().eq("id", q[0].id);
    }
    set({ stage: 0, extraMinutes: 0 });
    await supabase
      .from("chefe_state")
      .update({ stage: 0, extra_minutes: 0 })
      .eq("id", 1);
  },
  addTenMinutes: async () => {
    const next = get().extraMinutes + 10;
    set({ extraMinutes: next });
    await supabase.from("chefe_state").update({ extra_minutes: next }).eq("id", 1);
  },
  resetDemo: async () => {
    set({ stage: 0, extraMinutes: 0, presencialCount: 0, pessoasNoSalao: 0 });
    await Promise.all([
      supabase
        .from("chefe_state")
        .update({ stage: 0, extra_minutes: 0, presencial_count: 0 })
        .eq("id", 1),
      supabase
        .from("chefe_status_salao")
        .upsert({ id: 1, pessoas_no_salao: 0 }),
      supabase.from("chefe_queue").delete().neq("id", "00000000-0000-0000-0000-000000000000"),
    ]);
  },

  addToQueue: async (name, phone) => {
    const position = (get().queue.at(-1)?.position ?? 0) + 1;
    await supabase
      .from("chefe_queue")
      .insert({ name, phone: phone ?? null, position });
  },
  removeClient: async (id) => {
    await supabase.from("chefe_queue").delete().eq("id", id);
  },
  reorderQueue: async (ids) => {
    // Optimistic local reorder
    const map = new Map(get().queue.map((c) => [c.id, c]));
    const next = ids
      .map((id, i) => {
        const c = map.get(id);
        return c ? { ...c, position: i + 1 } : null;
      })
      .filter((x): x is QueueClient => x !== null);
    set({ queue: next });
    await Promise.all(
      next.map((c) =>
        supabase.from("chefe_queue").update({ position: c.position }).eq("id", c.id),
      ),
    );
  },

  aceitarPendente: async (id) => {
    const p = get().pendentes.find((x) => x.id === id);
    if (!p) return;
    const position = (get().queue.at(-1)?.position ?? 0) + 1;
    await supabase.from("chefe_queue").insert({
      name: p.name,
      phone: p.phone || null,
      referencia: p.referencia,
      perfil: p.perfil,
      qtd: p.qtd,
      position,
    });
    await supabase.from("chefe_pendentes").delete().eq("id", id);
  },
  recusarPendente: async (id) => {
    await supabase.from("chefe_pendentes").delete().eq("id", id);
  },

  bookAgenda: async ({ name, phone, scheduledAt }) => {
    const iso = scheduledAt.toISOString();
    const { data, error } = await supabase
      .from("chefe_agenda")
      .insert({ name, phone, scheduled_at: iso, status: "confirmado" })
      .select("id,name,phone,scheduled_at,status,notified_leave")
      .maybeSingle();
    if (error || !data) return null;
    return mapAgenda(data);
  },
  cancelAgenda: async (id) => {
    await supabase.from("chefe_agenda").delete().eq("id", id);
  },
  markAgendaNotified: async (id) => {
    await supabase.from("chefe_agenda").update({ notified_leave: true }).eq("id", id);
  },

  updateProfile: async (patch) => {
    set({ profile: { ...get().profile, ...patch } });
    const row = profilePatchToRow(patch);
    if (Object.keys(row).length === 0) return;
    await supabase.from("chefe_profile").upsert({ id: 1, ...row });
  },

  saveReview: async (r) => {
    if (r.id) {
      await supabase
        .from("chefe_reviews")
        .update({
          name: r.name,
          rating: r.rating,
          comment: r.comment,
          position: r.position,
        })
        .eq("id", r.id);
    } else {
      await supabase.from("chefe_reviews").insert({
        name: r.name,
        rating: r.rating,
        comment: r.comment,
        position: r.position,
      });
    }
  },
  deleteReview: async (id) => {
    await supabase.from("chefe_reviews").delete().eq("id", id);
  },

  uploadPortfolio: async (file) => {
    const ext = file.name.split(".").pop() || "jpg";
    const path = `portfolio/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("chefe-media")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (upErr) throw upErr;
    const { data: signed } = await supabase.storage
      .from("chefe-media")
      .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    const position = (get().portfolio.at(-1)?.position ?? 0) + 1;
    await supabase.from("chefe_portfolio").insert({
      url: signed?.signedUrl ?? "",
      media_type: mediaType,
      storage_path: path,
      position,
    });
  },
  deletePortfolio: async (id, storagePath) => {
    await supabase.storage.from("chefe-media").remove([storagePath]).catch(() => {});
    await supabase.from("chefe_portfolio").delete().eq("id", id);
  },

  hydrate: async () => {
    const [state, profile, queue, agenda, pendentes, portfolio, reviews, salao] =
      await Promise.all([
        supabase.from("chefe_state").select("*").eq("id", 1).maybeSingle(),
        supabase.from("chefe_profile").select("*").eq("id", 1).maybeSingle(),
        supabase.from("chefe_queue").select("id,name,phone,position").order("position"),
        supabase
          .from("chefe_agenda")
          .select("id,name,phone,scheduled_at,status,notified_leave")
          .order("scheduled_at"),
        supabase
          .from("chefe_pendentes")
          .select("id,name,phone,referencia,perfil,qtd")
          .order("created_at", { ascending: false }),
        supabase
          .from("chefe_portfolio")
          .select("id,url,media_type,storage_path,position")
          .order("position"),
        supabase
          .from("chefe_reviews")
          .select("id,name,rating,comment,position")
          .order("position"),
        supabase
          .from("chefe_status_salao")
          .select("pessoas_no_salao")
          .eq("id", 1)
          .maybeSingle(),
      ]);

    const s = state.data;
    set({
      status: ((s?.status as ChefeStatus) ?? "available") as ChefeStatus,
      stage: s?.stage ?? 0,
      extraMinutes: s?.extra_minutes ?? 0,
      presencialCount: s?.presencial_count ?? 0,
      instrucoesDoChefe: s?.instrucoes_do_chefe ?? "",
      pessoasNoSalao: salao.data?.pessoas_no_salao ?? 0,
      profile: mapProfile(profile.data as Record<string, unknown> | null),
      queue: (queue.data ?? []).map(mapQueue),
      agenda: (agenda.data ?? []).map(mapAgenda),
      pendentes: (pendentes.data ?? []) as Pendente[],
      portfolio: (portfolio.data ?? []).map(mapPortfolio),
      reviews: (reviews.data ?? []) as Review[],
    });
  },

  subscribe: () => {
    const ch = supabase
      .channel("chefe-store-sync")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_state" },
        () => get().hydrate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_profile" },
        () => get().hydrate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_queue" },
        () => get().hydrate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_agenda" },
        () => get().hydrate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_pendentes" },
        () => get().hydrate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_portfolio" },
        () => get().hydrate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_reviews" },
        () => get().hydrate(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "chefe_status_salao" },
        () => get().hydrate(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  },
}));
