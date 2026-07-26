import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Film, Plus, Star, ImagePlus } from "lucide-react";
import { toast } from "sonner";
import { useChefeStore, type Highlight } from "@/lib/chefe-store";

export function StoriesManager() {
  const stories = useChefeStore((s) => s.stories) ?? [];
  const highlights = useChefeStore((s) => s.highlights) ?? [];
  const uploadStory = useChefeStore((s) => s.uploadStory);
  const deleteStory = useChefeStore((s) => s.deleteStory);
  const createHighlight = useChefeStore((s) => s.createHighlight);
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
            {(stories ?? [])
              .filter((s) => Boolean(s?.id))
              .map((s) => (
                <div key={s.id} className="group relative aspect-[9/16] overflow-hidden rounded-lg">
                  {s.mediaType === "video" ? (
                    <video
                      src={s.mediaUrl}
                      muted
                      playsInline
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src={s.mediaUrl || "/placeholder.svg"}
                      alt=""
                      className="h-full w-full object-cover"
                    />
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
        <p className="mb-3 text-[11px] text-muted-foreground">
          Crie quantos álbuns quiser. O título é opcional — sem título, aparece só a bolha.
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={async () => {
            await createHighlight("");
            toast.success("Novo destaque criado");
          }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white"
        >
          <Plus className="h-4 w-4" /> Novo destaque
        </motion.button>
        <div className="space-y-3">
          {(highlights ?? [])
            .filter((h): h is Highlight => Boolean(h?.id))
            .map((h) => (
              <HighlightEditor
                key={h.id}
                highlight={h}
                onDelete={async () => {
                  if (!confirm("Excluir destaque?")) return;
                  await deleteHighlight(h.id);
                  toast("Destaque excluído");
                }}
              />
            ))}
          {highlights.length === 0 && (
            <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
              Nenhum destaque criado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function HighlightEditor({ highlight, onDelete }: { highlight: Highlight; onDelete: () => void }) {
  const saveHighlight = useChefeStore((s) => s.saveHighlight);
  const media = useChefeStore((s) =>
    (s.highlightMedia ?? []).filter((m) => m?.highlightId === highlight?.id),
  );
  const uploadHighlightMedia = useChefeStore((s) => s.uploadHighlightMedia);
  const deleteHighlightMedia = useChefeStore((s) => s.deleteHighlightMedia);
  const uploadHighlightCover = useChefeStore((s) => s.uploadHighlightCover);

  const [title, setTitle] = useState(highlight.title ?? "");
  const [busy, setBusy] = useState(false);
  const mediaInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  const cover = highlight.coverImage ?? media.find((m) => m.mediaType === "image")?.url;

  return (
    <div className="rounded-2xl bg-white/[0.03] p-3 ring-1 ring-white/5">
      <div className="mb-3 flex items-center gap-3">
        <button
          onClick={() => coverInput.current?.click()}
          className="relative grid h-14 w-14 shrink-0 place-items-center overflow-hidden rounded-full bg-gradient-ig"
          title="Definir capa"
        >
          {cover ? (
            <img src={cover} alt="" className="absolute inset-[2px] rounded-full object-cover" />
          ) : (
            <ImagePlus className="h-5 w-5 text-white" />
          )}
        </button>
        <input
          ref={coverInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            setBusy(true);
            try {
              await uploadHighlightCover(highlight.id, f);
              toast.success("Capa atualizada");
            } catch {
              toast.error("Erro ao enviar capa");
            } finally {
              setBusy(false);
            }
          }}
        />
        <input
          placeholder="Título (opcional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={async () => {
            if ((highlight.title ?? "") === title) return;
            await saveHighlight({ ...highlight, title });
            toast.success("Destaque salvo");
          }}
          className="min-w-0 flex-1 rounded-xl bg-white/[0.04] px-3 py-2 text-sm outline-none ring-1 ring-border"
        />
        <button
          onClick={onDelete}
          className="rounded-xl bg-rose-500/15 px-3 py-2 text-xs font-bold text-rose-300 ring-1 ring-rose-400/30"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {(media ?? []).length > 0 && (
        <div className="mb-2 grid grid-cols-4 gap-1.5">
          {(media ?? [])
            .filter((m) => Boolean(m?.id))
            .map((m) => (
              <div key={m.id} className="group relative aspect-square overflow-hidden rounded-lg">
                {m.mediaType === "video" ? (
                  <video src={m.url} muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <img
                    src={m.url || "/placeholder.svg"}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  onClick={async () => {
                    if (!confirm("Remover mídia?")) return;
                    await deleteHighlightMedia(m.id, m.storagePath);
                  }}
                  className="absolute inset-x-0 bottom-0 bg-rose-500/90 py-0.5 text-[9px] font-bold text-white opacity-0 transition-opacity group-active:opacity-100"
                >
                  Excluir
                </button>
              </div>
            ))}
        </div>
      )}

      <input
        ref={mediaInput}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          e.target.value = "";
          if (files.length === 0) return;
          setBusy(true);
          try {
            for (const f of files) await uploadHighlightMedia(highlight.id, f);
            toast.success(`${files.length} mídia(s) adicionada(s)`);
          } catch {
            toast.error("Erro ao enviar mídia");
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        disabled={busy}
        onClick={() => mediaInput.current?.click()}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/15 px-3 py-2.5 text-xs font-bold text-emerald-300 ring-1 ring-emerald-400/30 disabled:opacity-50"
      >
        <Upload className="h-3.5 w-3.5" /> {busy ? "Enviando…" : "Adicionar fotos/vídeos"}
      </button>
    </div>
  );
}
