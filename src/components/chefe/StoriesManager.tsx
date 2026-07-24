import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Film, Plus, Star } from "lucide-react";
import { toast } from "sonner";
import { useChefeStore, type Highlight } from "@/lib/chefe-store";

export function StoriesManager() {
  const stories = useChefeStore((s) => s.stories);
  const highlights = useChefeStore((s) => s.highlights);
  const uploadStory = useChefeStore((s) => s.uploadStory);
  const deleteStory = useChefeStore((s) => s.deleteStory);
  const saveHighlight = useChefeStore((s) => s.saveHighlight);
  const deleteHighlight = useChefeStore((s) => s.deleteHighlight);

  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      for (const f of files) await uploadStory(f, caption || undefined);
      toast.success(`${files.length} story(s) publicado(s)`);
      setCaption("");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao enviar story");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <section className="glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-fuchsia-300">
          ✨ Publicar Story (expira em 24h)
        </p>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Legenda opcional…"
          className="mb-3 w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm outline-none ring-1 ring-border placeholder:text-muted-foreground/60 focus:ring-fuchsia-400/60"
        />
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
          {busy ? "Enviando…" : "Enviar story (foto/vídeo)"}
        </motion.button>
      </section>

      <section className="glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Stories ativos ({stories.length})
        </p>
        {stories.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
            Nenhum story ativo.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-1.5">
            {stories.map((s) => (
              <div key={s.id} className="group relative aspect-[9/16] overflow-hidden rounded-lg">
                {s.mediaType === "video" ? (
                  <video
                    src={s.mediaUrl}
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img src={s.mediaUrl} alt="" className="h-full w-full object-cover" />
                )}
                {s.mediaType === "video" && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                    <Film className="inline h-3 w-3" />
                  </span>
                )}
                <button
                  onClick={async () => {
                    if (!confirm("Excluir story?")) return;
                    await deleteStory(s.id, s.storagePath);
                    toast("Story excluído");
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

      <section className="glass rounded-3xl p-5">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-amber-300">
          <Star className="mr-1 inline h-3 w-3" /> Destaques ({highlights.length})
        </p>
        <div className="space-y-3">
          {highlights.map((h) => (
            <HighlightEditor
              key={h.id}
              highlight={h}
              storyOptions={stories.map((s) => ({ id: s.id, url: s.mediaUrl }))}
              onSave={async (patch) => {
                await saveHighlight({ ...h, ...patch });
                toast.success("Destaque salvo");
              }}
              onDelete={async () => {
                if (!confirm("Excluir destaque?")) return;
                await deleteHighlight(h.id);
                toast("Destaque excluído");
              }}
            />
          ))}
          <HighlightEditor
            storyOptions={stories.map((s) => ({ id: s.id, url: s.mediaUrl }))}
            onSave={async (patch) => {
              await saveHighlight({
                title: patch.title ?? "Novo",
                coverImage: patch.coverImage ?? null,
                storyIds: patch.storyIds ?? [],
                orderIndex: highlights.length,
              });
              toast.success("Destaque criado");
            }}
          />
        </div>
      </section>
    </div>
  );
}

function HighlightEditor({
  highlight,
  storyOptions,
  onSave,
  onDelete,
}: {
  highlight?: Highlight;
  storyOptions: { id: string; url: string }[];
  onSave: (patch: Partial<Highlight>) => Promise<void>;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(highlight?.title ?? "");
  const [cover, setCover] = useState(highlight?.coverImage ?? "");
  const [selected, setSelected] = useState<string[]>(highlight?.storyIds ?? []);
  const isNew = !highlight;

  const toggle = (id: string) => {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };

  return (
    <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5">
      <div className="mb-2 grid grid-cols-2 gap-2">
        <input
          placeholder="Título (ex: Cortes)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded-xl bg-white/[0.04] px-3 py-2 text-sm outline-none ring-1 ring-border"
        />
        <input
          placeholder="URL capa (opcional)"
          value={cover}
          onChange={(e) => setCover(e.target.value)}
          className="rounded-xl bg-white/[0.04] px-3 py-2 text-sm outline-none ring-1 ring-border"
        />
      </div>
      {storyOptions.length > 0 && (
        <div className="mb-2">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Stories vinculados ({selected.length})
          </p>
          <div className="grid grid-cols-6 gap-1">
            {storyOptions.map((s) => {
              const active = selected.includes(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => toggle(s.id)}
                  className={`relative aspect-square overflow-hidden rounded ring-2 ${
                    active ? "ring-fuchsia-400" : "ring-transparent"
                  }`}
                >
                  <img src={s.url} alt="" className="h-full w-full object-cover" />
                  {active && (
                    <span className="absolute inset-0 grid place-items-center bg-fuchsia-500/40 text-xs text-white">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <button
          onClick={async () => {
            if (!title.trim()) {
              toast.error("Título obrigatório");
              return;
            }
            await onSave({
              title: title.trim(),
              coverImage: cover.trim() || null,
              storyIds: selected,
            });
            if (isNew) {
              setTitle("");
              setCover("");
              setSelected([]);
            }
          }}
          className="flex-1 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30"
        >
          {isNew ? (
            <>
              <Plus className="mr-1 inline h-3 w-3" /> Criar
            </>
          ) : (
            "Salvar"
          )}
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