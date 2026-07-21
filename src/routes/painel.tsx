import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, Play, Scissors, Plus, Minus, Clock, RotateCcw, Users, Inbox, Check, X, MessageCircle, User, Star, ImagePlus, Trash2, Upload, Cpu, Film } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useChefeStore, statusMeta, type ChefeStatus, type Review } from "@/lib/chefe-store";
import { GradientAvatar } from "@/components/chefe/GradientAvatar";
import { ShareButton } from "@/components/chefe/ShareButton";
import { PinLock } from "@/components/chefe/PinLock";
import { ConfigAI } from "@/components/chefe/ConfigAI";
import { toast } from "sonner";

export const Route = createFileRoute("/painel")({
  head: () => ({
    meta: [
      { title: "Painel do CHEFE — Controle Manual" },
      { name: "description", content: "Painel privado de controle do atendimento em tempo real." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PainelGate,
});

function PainelGate() {
  return (
    <PinLock>
      <Painel />
    </PinLock>
  );
}

const statuses: ChefeStatus[] = ["available", "busy", "break", "closed"];
type Tab = "operacao" | "perfil" | "portfolio" | "ia";

function Painel() {
  const [tab, setTab] = useState<Tab>("operacao");
  const status = useChefeStore((s) => s.status);
  const setStatus = useChefeStore((s) => s.setStatus);
  const queue = useChefeStore((s) => s.queue);
  const stage = useChefeStore((s) => s.stage);
  const startCut = useChefeStore((s) => s.startCut);
  const completeAndNext = useChefeStore((s) => s.completeAndNext);
  const addTenMinutes = useChefeStore((s) => s.addTenMinutes);
  const resetDemo = useChefeStore((s) => s.resetDemo);
  const extra = useChefeStore((s) => s.extraMinutes);
  const presencial = useChefeStore((s) => s.presencialCount);
  const incPresencial = useChefeStore((s) => s.incPresencial);
  const decPresencial = useChefeStore((s) => s.decPresencial);
  const pendentes = useChefeStore((s) => s.pendentes);
  const aceitarPendente = useChefeStore((s) => s.aceitarPendente);
  const recusarPendente = useChefeStore((s) => s.recusarPendente);
  const profile = useChefeStore((s) => s.profile);
  const instrucoesDoChefe = useChefeStore((s) => s.instrucoesDoChefe);

  const current = queue[0];

  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-24 pt-6">
      <header className="mb-6 flex items-center justify-between">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <button
          onClick={() => {
            resetDemo();
            toast("Demo resetada");
          }}
          className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-[11px] font-semibold text-muted-foreground"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <GradientAvatar size={64} animated={false} src={profile.avatarUrl} />
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Painel privado
          </p>
          <h1 className="truncate text-2xl font-black leading-tight">Comando CHEFE</h1>
        </div>
      </div>

      {/* Tabs */}
      <nav className="mb-4 grid grid-cols-4 gap-1 rounded-2xl glass p-1">
        {(
          [
            { id: "operacao", label: "Operação", icon: Play },
            { id: "perfil", label: "App", icon: User },
            { id: "portfolio", label: "Portfólio", icon: ImagePlus },
            { id: "ia", label: "IA", icon: Cpu },
          ] as const
        ).map((t) => {
          const active = tab === t.id;
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-[10px] font-bold transition ${
                active
                  ? "bg-gradient-ig text-white shadow-lg"
                  : "text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
            </button>
          );
        })}
      </nav>

      {tab === "perfil" && <EditorPerfil />}
      {tab === "portfolio" && <EditorPortfolio />}
      {tab === "ia" && <ConfigAI />}
      {tab !== "operacao" ? null : (
        <>
      {/* Share link block */}
      <section className="mb-4">
        <ShareButton variant="block" />
      </section>

      {/* Banner direcionando para o Chat Privado (aba IA) */}
      <button
        onClick={() => setTab("ia")}
        className="mb-4 flex w-full items-center gap-3 rounded-3xl p-[1.5px] text-left"
        style={{ background: "var(--gradient-ig)" }}
      >
        <div className="flex w-full items-center gap-3 rounded-[calc(1.5rem-1.5px)] glass-strong p-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gradient-ig">
            <Cpu className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-sky-300">
              Canal privado de comando · CHEFE
            </p>
            <p className="mt-0.5 text-sm font-bold leading-tight">
              Digite ordens no <span className="text-gradient-ig">Chat Privado</span> → aba IA
            </p>
            {instrucoesDoChefe && (
              <p className="mt-1 truncate text-[11px] text-muted-foreground">
                Última ordem ao vivo: “{instrucoesDoChefe}”
              </p>
            )}
          </div>
          <span className="text-lg">→</span>
        </div>
      </button>

      {/* Solicitações pendentes da IA */}
      <section className="mb-4 glass rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Inbox className="h-4 w-4" style={{ color: "#38bdf8" }} />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Solicitações da IA
            </p>
          </div>
          <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[11px] font-black tabular-nums text-sky-300 ring-1 ring-sky-400/30">
            {pendentes.length}
          </span>
        </div>

        {pendentes.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
            Nenhuma solicitação pendente.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {pendentes.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5"
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black">👤 {p.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      📱 {p.phone} · 👥 {p.qtd} corte{p.qtd > 1 ? "s" : ""}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      📍 {p.referencia}
                    </p>
                  </div>
                  <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                    {p.perfil}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      aceitarPendente(p.id);
                      toast.success(`${p.name} adicionado à fila`);
                    }}
                    className="flex items-center justify-center gap-1 rounded-xl bg-emerald-500/15 px-2 py-2 text-[11px] font-bold text-emerald-300 ring-1 ring-emerald-400/30"
                  >
                    <Check className="h-3.5 w-3.5" /> Aceitar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      const msg = encodeURIComponent(
                        `Fala ${p.name.split(" ")[0]}! Aqui é o CHEFE. Precisamos remarcar seu corte, tudo bem?`,
                      );
                      window.open(
                        `https://api.whatsapp.com/send?phone=${p.phone.replace(/\D/g, "")}&text=${msg}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="flex items-center justify-center gap-1 rounded-xl bg-amber-500/15 px-2 py-2 text-[11px] font-bold text-amber-300 ring-1 ring-amber-400/30"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> Remarcar
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      recusarPendente(p.id);
                      toast(`${p.name} recusado`);
                    }}
                    className="flex items-center justify-center gap-1 rounded-xl bg-rose-500/15 px-2 py-2 text-[11px] font-bold text-rose-300 ring-1 ring-rose-400/30"
                  >
                    <X className="h-3.5 w-3.5" /> Recusar
                  </motion.button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Status selector */}
      <section className="glass rounded-3xl p-4">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Alterar Status
        </p>
        <div className="grid grid-cols-2 gap-2">
          {statuses.map((s) => {
            const meta = statusMeta[s];
            const active = status === s;
            return (
              <motion.button
                key={s}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setStatus(s);
                  toast(`Status: ${meta.label}`);
                }}
                className={`relative flex items-center gap-2 rounded-2xl px-4 py-4 text-left transition ${
                  active
                    ? "bg-white/[0.06] ring-1 ring-neon/60"
                    : "bg-white/[0.02] ring-1 ring-border"
                }`}
              >
                <span className="text-2xl">{meta.emoji}</span>
                <span className="text-sm font-bold">{meta.label}</span>
                {active && (
                  <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-neon shadow-neon" />
                )}
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* Current client */}
      <section className="mt-4 relative overflow-hidden rounded-3xl p-[1.5px]">
        <div className="absolute inset-0 bg-gradient-ig" />
        <div className="relative rounded-[calc(1.5rem-1.5px)] glass-strong p-5">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-widest text-gradient-ig">
            Cliente atual
          </p>
          <h2 className="text-2xl font-black">{current?.name ?? "Nenhum cliente"}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {queue.length > 0
              ? `${queue.length} na fila · estágio ${stage + 1}/4`
              : "Adicione um novo cliente abaixo."}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <BigActionButton
              icon={Play}
              label="Iniciar Corte"
              disabled={!current || stage >= 2}
              onClick={() => {
                startCut();
                toast("Corte iniciado ✂️");
              }}
              variant="neon"
            />
            <BigActionButton
              icon={Scissors}
              label="Concluir / Próximo"
              disabled={!current}
              onClick={() => {
                completeAndNext();
                toast("Cliente concluído. Próximo na cadeira!");
              }}
              variant="ig"
            />
          </div>
        </div>
      </section>

      {/* Add 10 min */}
      <section className="mt-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            addTenMinutes();
            toast("+10 min adicionados. Fila notificada.");
          }}
          className="flex w-full items-center justify-between rounded-3xl glass p-5 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-ig">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-base font-black">+10 Minutos</p>
              <p className="text-xs text-muted-foreground">Recalcula e notifica toda a fila</p>
            </div>
          </div>
          <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-bold tabular-nums text-neon">
            +{extra} min
          </span>
        </motion.button>
      </section>

      {/* Contador presencial — isolado da agenda virtual */}
      <section className="mt-4 glass rounded-3xl p-5">
        <div className="mb-1 flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Clientes no Presencial (Rua)
          </p>
        </div>
        <p className="mb-4 text-xs text-muted-foreground">
          Adicione ou remova conforme chegam no salão. Contagem separada da agenda virtual.
        </p>
        <div className="flex items-center justify-center gap-6">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              decPresencial();
              toast("Presencial: -1");
            }}
            disabled={presencial === 0}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-white/[0.05] ring-1 ring-border text-white disabled:opacity-30"
          >
            <Minus className="h-6 w-6" />
          </motion.button>
          <div className="min-w-[80px] text-center">
            <div className="text-5xl font-black tabular-nums text-gradient-ig leading-none">
              {presencial}
            </div>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              na rua
            </div>
          </div>
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              incPresencial();
              toast("Presencial: +1");
            }}
            className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-ig text-white shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </motion.button>
        </div>
      </section>

      {/* Queue mini */}
      <section className="mt-4 glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Fila atual
        </p>
        <ul className="space-y-2">
          {queue.length === 0 && (
            <li className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-sm text-muted-foreground">
              Fila vazia
            </li>
          )}
          {queue.map((c, i) => (
            <li
              key={c.id}
              className="flex items-center justify-between rounded-2xl bg-white/[0.03] px-3 py-2.5"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white/10 text-[11px] font-black">
                  {i + 1}
                </span>
                <span className="text-sm font-semibold">{c.name}</span>
              </div>
              {c.phone && <span className="text-[11px] text-muted-foreground">{c.phone}</span>}
            </li>
          ))}
        </ul>
      </section>
        </>
      )}

      <footer className="mt-10 text-center text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Plus className="mx-auto mb-2 h-4 w-4 opacity-40" />
        Painel restrito · CHEFE
      </footer>
    </main>
  );
}

function EditorPerfil() {
  const profile = useChefeStore((s) => s.profile);
  const updateProfile = useChefeStore((s) => s.updateProfile);
  const reviews = useChefeStore((s) => s.reviews);
  const saveReview = useChefeStore((s) => s.saveReview);
  const deleteReview = useChefeStore((s) => s.deleteReview);
  const uploadPortfolio = useChefeStore((s) => s.uploadPortfolio);

  const [form, setForm] = useState(profile);
  useEffect(() => setForm(profile), [profile]);
  const avatarInput = useRef<HTMLInputElement>(null);

  const onSaveProfile = async () => {
    await updateProfile(form);
    toast.success("Perfil atualizado");
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const path = `avatar/${crypto.randomUUID()}.${file.name.split(".").pop() || "jpg"}`;
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.storage
        .from("chefe-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) throw error;
      const { data: signed } = await supabase.storage
        .from("chefe-media")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      await updateProfile({ avatarUrl: signed?.signedUrl ?? null });
      toast.success("Foto atualizada");
    } catch (err) {
      toast.error("Erro ao enviar foto");
      console.error(err);
    }
    e.target.value = "";
  };
  void uploadPortfolio;

  return (
    <div className="space-y-4">
      <section className="glass rounded-3xl p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Perfil público
        </p>
        <div className="mb-4 flex items-center gap-4">
          <GradientAvatar size={72} animated={false} src={profile.avatarUrl} />
          <div>
            <input
              ref={avatarInput}
              type="file"
              accept="image/*"
              onChange={onAvatarChange}
              className="hidden"
            />
            <button
              onClick={() => avatarInput.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full bg-gradient-ig px-3 py-1.5 text-[11px] font-bold text-white"
            >
              <Upload className="h-3 w-3" /> Trocar foto
            </button>
          </div>
        </div>
        <Field label="Nome de usuário">
          <input
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className={inputCls}
          />
        </Field>
        <Field label="Bio">
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={2}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cortes realizados">
            <input
              value={form.cutsCount}
              onChange={(e) => setForm({ ...form, cutsCount: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Nota média">
            <input
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSaveProfile}
          className="mt-2 w-full rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white"
        >
          Salvar perfil
        </motion.button>
      </section>

      <section className="glass rounded-3xl p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-sky-300">
          📞 Contato & Localização
        </p>
        <Field label="Número de Telefone Oficial">
          <input
            placeholder="+55 11 99999-9999"
            value={form.phoneOfficial ?? ""}
            onChange={(e) => setForm({ ...form, phoneOfficial: e.target.value || null })}
            className={inputCls}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude atual">
            <input
              type="number"
              step="any"
              placeholder="-23.5505"
              value={form.latitude ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  latitude: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={inputCls}
            />
          </Field>
          <Field label="Longitude atual">
            <input
              type="number"
              step="any"
              placeholder="-46.6333"
              value={form.longitude ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  longitude: e.target.value === "" ? null : Number(e.target.value),
                })
              }
              className={inputCls}
            />
          </Field>
        </div>
        <button
          type="button"
          onClick={() => {
            if (!navigator.geolocation) return toast.error("Geolocalização indisponível");
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const lat = pos.coords.latitude;
                const lng = pos.coords.longitude;
                setForm((f) => ({ ...f, latitude: lat, longitude: lng }));
                await updateProfile({ latitude: lat, longitude: lng });
                toast.success("📍 Localização capturada e salva");
              },
              () => toast.error("Não foi possível obter localização"),
              { enableHighAccuracy: true },
            );
          }}
          className="mt-1 w-full rounded-xl bg-sky-500/15 px-3 py-3 text-xs font-black uppercase tracking-widest text-sky-300 ring-1 ring-sky-400/40 hover:bg-sky-500/25"
        >
          📍 Usar minha localização atual
        </button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSaveProfile}
          className="mt-3 w-full rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white"
        >
          Salvar contato & localização
        </motion.button>
      </section>

      <section className="glass rounded-3xl p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-emerald-300">
          💈 Serviço
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Preço Base do Serviço">
            <input
              value={form.servicePrice}
              onChange={(e) => setForm({ ...form, servicePrice: e.target.value })}
              className={inputCls}
            />
          </Field>
          <Field label="Duração Média (min)">
            <input
              type="number"
              value={form.serviceDurationMin}
              onChange={(e) =>
                setForm({ ...form, serviceDurationMin: Number(e.target.value) || 30 })
              }
              className={inputCls}
            />
          </Field>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSaveProfile}
          className="mt-2 w-full rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white"
        >
          Salvar serviço
        </motion.button>
      </section>

      <section className="glass rounded-3xl p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-fuchsia-300">
          🤖 IA Atendente — Saudação Inicial
        </p>
        <Field label="Saudação Inicial da IA">
          <textarea
            value={form.aiGreeting}
            onChange={(e) => setForm({ ...form, aiGreeting: e.target.value })}
            rows={3}
            className={inputCls}
          />
        </Field>
        <p className="mb-2 text-[10px] text-muted-foreground">
          Esta é a primeira frase que a IA Atendente fala com o cliente no chat público.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onSaveProfile}
          className="mt-2 w-full rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white"
        >
          Salvar saudação
        </motion.button>
      </section>

      <section className="glass rounded-3xl p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
              Depoimentos ({reviews.length}/3)
            </p>
          </div>
        </div>
        <div className="space-y-3">
          {reviews.map((r) => (
            <ReviewEditor
              key={r.id}
              review={r}
              onSave={saveReview}
              onDelete={() => deleteReview(r.id)}
            />
          ))}
          {reviews.length < 3 && (
            <ReviewEditor
              onSave={async (r) => {
                await saveReview({ ...r, position: reviews.length + 1 });
                toast.success("Depoimento adicionado");
              }}
            />
          )}
        </div>
      </section>
    </div>
  );
}

function ReviewEditor({
  review,
  onSave,
  onDelete,
}: {
  review?: Review;
  onSave: (r: Omit<Review, "id"> & { id?: string }) => Promise<void>;
  onDelete?: () => void;
}) {
  const [name, setName] = useState(review?.name ?? "");
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");
  const isNew = !review;

  return (
    <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5">
      <div className="mb-2 grid grid-cols-[1fr_auto] gap-2">
        <input
          placeholder="Nome do cliente"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
        />
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className={`${inputCls} w-20`}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n}★
            </option>
          ))}
        </select>
      </div>
      <textarea
        placeholder="Comentário"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
        className={inputCls}
      />
      <div className="mt-2 flex gap-2">
        <button
          onClick={async () => {
            if (!name.trim() || !comment.trim()) {
              toast.error("Preencha nome e comentário");
              return;
            }
            await onSave({
              id: review?.id,
              name: name.trim(),
              rating,
              comment: comment.trim(),
              position: review?.position ?? 0,
            });
            if (isNew) {
              setName("");
              setComment("");
              setRating(5);
            } else {
              toast.success("Depoimento salvo");
            }
          }}
          className="flex-1 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30"
        >
          {isNew ? "Adicionar" : "Salvar"}
        </button>
        {onDelete && (
          <button
            onClick={onDelete}
            className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-300 ring-1 ring-rose-400/30"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

function EditorPortfolio() {
  const portfolio = useChefeStore((s) => s.portfolio);
  const uploadPortfolio = useChefeStore((s) => s.uploadPortfolio);
  const deletePortfolio = useChefeStore((s) => s.deletePortfolio);
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      for (const f of files) await uploadPortfolio(f);
      toast.success(`${files.length} foto(s) enviada(s)`);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar fotos");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <section className="glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Adicionar fotos e vídeos
        </p>
        <input
          ref={input}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={onFiles}
          className="hidden"
        />
        <motion.button
          whileTap={{ scale: 0.97 }}
          disabled={busy}
          onClick={() => input.current?.click()}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-ig px-4 py-4 text-sm font-black text-white disabled:opacity-50"
        >
          <Upload className="h-5 w-5" />
          {busy ? "Enviando..." : "Enviar da galeria"}
        </motion.button>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          Fotos (jpg, png) ou vídeos (mp4, mov) — direto do celular
        </p>
      </section>

      <section className="glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Galeria ({portfolio.length})
        </p>
        {portfolio.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
            Nenhuma foto enviada. Enviando: as fotos aparecem no perfil público.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {portfolio.map((p) => (
              <div key={p.id} className="group relative aspect-square overflow-hidden rounded-lg">
                {p.mediaType === "video" ? (
                  <video
                    src={p.url}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={p.url}
                    alt="Portfolio"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                {p.mediaType === "video" && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    <Film className="inline h-3 w-3" />
                  </span>
                )}
                <button
                  onClick={async () => {
                    if (!confirm("Excluir esta mídia?")) return;
                    await deletePortfolio(p.id, p.storagePath);
                    toast("Mídia excluída");
                  }}
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-rose-500/90 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity group-active:opacity-100"
                >
                  <Trash2 className="h-3 w-3" /> Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-foreground outline-none ring-1 ring-border transition placeholder:text-muted-foreground/60 focus:ring-neon/60";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      {children}
    </label>
  );
}

function BigActionButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  variant,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant: "neon" | "ig";
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 rounded-2xl px-3 py-5 text-center font-black disabled:opacity-40"
      style={{
        background:
          variant === "neon"
            ? "color-mix(in oklab, var(--neon) 20%, transparent)"
            : "var(--gradient-ig)",
        color: variant === "neon" ? "var(--neon)" : "#fff",
        boxShadow:
          variant === "neon"
            ? "0 0 24px rgba(74,222,128,0.25), inset 0 0 0 1px rgba(74,222,128,0.4)"
            : "0 8px 32px rgba(233,65,121,0.35)",
      }}
    >
      <Icon className="h-6 w-6" />
      <span className="text-sm leading-tight">{label}</span>
    </motion.button>
  );
}