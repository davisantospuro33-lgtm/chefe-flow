import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Film, Plus, Star, ImagePlus, Heart, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useChefeStore, type Highlight } from "@/lib/chefe-store";

export function StoriesManager() {
  const stories = useChefeStore((s) => s?.stories) ?? [];
  const highlights = useChefeStore((s) => s?.highlights) ?? [];
  const uploadStory = useChefeStore((s) => s?.uploadStory);
  const deleteStory = useChefeStore((s) => s?.deleteStory);
  const createHighlight = useChefeStore((s) => s?.createHighlight);
  const deleteHighlight = useChefeStore((s) => s?.deleteHighlight);

  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [caption, setCaption] = useState("");

  const onFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setBusy(true);
    try {
      if (uploadStory) {
        for (const f of files) await uploadStory(f, caption);
        toast.success(`${files.length} story(s) publicado(s)`);
      }
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
      {/* SEÇÃO 1: PUBLICAR STORY (ESTILO INSTAGRAM 24H) */}
      <section className="glass rounded-3xl p-5 border border-white/10 bg-black/40">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <Film className="h-3.5 w-3.5 text-amber-400" /> Publicar Story (expira em 24h)
        </p>
        <input
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Legenda ou frase marcante..."
          className="mb-3 w-full rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500/50"
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
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 py-3 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
        >
          <Upload className="h-4 w-4" />
          {busy ? "Publicando..." : "Postar no Stories"}
        </motion.button>
      </section>

      {/* SEÇÃO 2: STORIES ATIVOS */}
      <section className="glass rounded-3xl p-5 border border-white/10 bg-black/40">
        <p className="mb-3 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
          Stories Ativos ({stories.length})
        </p>
        {stories.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.02] p-4 text-center text-xs text-muted-foreground border border-white/5">
            Nenhum story ativo no momento.
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {stories.map((s) => (
              <div key={s.id} className="group relative aspect-[9/16] overflow-hidden rounded-2xl bg-black border border-white/10">
                {s.mediaType === "video" ? (
                  <video src={s.mediaUrl} muted playsInline className="h-full w-full object-cover" />
                ) : (
                  <img src={s.mediaUrl} alt="" className="h-full w-full object-cover" />
                )}
                
                {/* Ícone de Tipo */}
                <div className="absolute top-2 left-2 flex gap-1">
                  {s.mediaType === "video" && (
                    <span className="rounded-md bg-black/60 p-1 text-[10px] text-white backdrop-blur-md">
                      <Film className="h-3 w-3" />
                    </span>
                  )}
                </div>

                {/* Ações / Botão Excluir */}
                <button
                  onClick={async () => {
                    if (confirm("Deseja apagar este story antes de expirar?")) {
                      if (deleteStory) await deleteStory(s.id, s.storagePath);
                      toast("Story excluído com sucesso");
                    }
                  }}
                  className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-rose-950/80 p-2 text-[10px] font-bold text-rose-300 backdrop-blur-md hover:bg-rose-900"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Excluir
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SEÇÃO 3: DESTAQUES DO PERFIL (ÁLBUNS PERMANENTES) */}
      <section className="glass rounded-3xl p-5 border border-white/10 bg-black/40">
        <div className="mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-400" /> Destaques do Perfil
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Crie álbuns com foto de capa e várias fotos/vídeos que nunca expiram.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={async () => {
            if (createHighlight) {
              await createHighlight("Novo Destaque");
              toast.success("Álbum de destaque criado!");
            }
          }}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 py-3 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          <Plus className="h-4 w-4" /> Criar Novo Destaque
        </motion.button>

        <div className="space-y-3">
          {highlights.map((h) => (
            <HighlightEditor
              key={h.id}
              highlight={h}
              onDelete={async () => {
                if (confirm("Excluir este destaque e todas as mídias dele?")) {
                  if (deleteHighlight) await deleteHighlight(h.id);
                  toast("Destaque excluído");
                }
              }}
            />
          ))}
          {highlights.length === 0 && (
            <p className="rounded-2xl bg-white/[0.02] p-4 text-center text-xs text-muted-foreground border border-white/5">
              Nenhum destaque criado ainda.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function HighlightEditor({
  highlight,
  onDelete,
}: {
  highlight: Highlight;
  onDelete: () => void;
}) {
  const saveHighlight = useChefeStore((s) => s?.saveHighlight);
  const highlightMedia = useChefeStore((s) => s?.highlightMedia) ?? [];
  const deleteHighlightMedia = useChefeStore((s) => s?.deleteHighlightMedia);
  const uploadHighlightMedia = useChefeStore((s) => s?.uploadHighlightMedia);
  const uploadHighlightCover = useChefeStore((s) => s?.uploadHighlightCover);

  // Filtra de forma segura sem estourar se o array for indefinido
  const media = (highlightMedia ?? []).filter((m) => m && m.highlightId === highlight.id);

  const [title, setTitle] = useState(highlight?.title ?? "");
  const [busy, setBusy] = useState(false);
  const mediaInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  // Pega a capa escolhida ou a primeira imagem da lista com fallback de segurança
  const cover = highlight?.coverImage ?? media.find((m) => m?.mediaType === "image")?.url;

  return (
    <div className="rounded-2xl bg-white/[0.03] p-3.5 border border-white/10 space-y-3">
      <div className="flex items-center gap-3">
        {/* Capa do Destaque (Redonda tipo Instagram) */}
        <button
          onClick={() => coverInput.current?.click()}
          className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-amber-500/50 bg-black/60 shadow-lg"
          title="Alterar Capa"
        >
          {cover ? (
            <img src={cover} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus className="h-4 w-4 text-amber-400" />
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
              if (uploadHighlightCover) {
                await uploadHighlightCover(highlight.id, f);
                toast.success("Capa do destaque atualizada!");
              }
            } catch {
              toast.error("Erro ao enviar capa");
            } finally {
              setBusy(false);
            }
          }}
        />

        {/* Título do Destaque */}
        <input
          placeholder="Nome do Destaque..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={async () => {
            if ((highlight.title ?? "") !== title && saveHighlight) {
              await saveHighlight({ ...highlight, title });
              toast.success("Título salvo");
            }
          }}
          className="min-w-0 flex-1 rounded-xl bg-black/50 border border-white/10 px-3 py-2 text-xs text-white placeholder:text-muted-foreground focus:outline-none focus:border-amber-500"
        />

        {/* Botão Apagar Destaque */}
        <button
          onClick={onDelete}
          className="rounded-xl bg-rose-500/10 p-2.5 text-rose-400 hover:bg-rose-500/20 transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Grid de Mídias dentro do Destaque */}
      {media.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {media.map((m) => (
            <div key={m.id} className="group relative aspect-square overflow-hidden rounded-xl bg-black border border-white/10">
              {m.mediaType === "video" ? (
                <video src={m.url} muted playsInline className="h-full w-full object-cover" />
              ) : (
                <img src={m.url} alt="" className="h-full w-full object-cover" />
              )}
              <button
                onClick={async () => {
                  if (confirm("Remover esta mídia do destaque?") && deleteHighlightMedia) {
                    await deleteHighlightMedia(m.id, m.storagePath);
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/70 text-[9px] font-bold text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                Excluir
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Adicionar Mídias ao Destaque */}
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
            if (uploadHighlightMedia) {
              for (const f of files) await uploadHighlightMedia(highlight.id, f);
              toast.success(`${files.length} mídia(s) adicionada(s)`);
            }
          } catch {
            toast.error("Erro ao enviar mídias");
          } finally {
            setBusy(false);
          }
        }}
      />
      <button
        disabled={busy}
        onClick={() => mediaInput.current?.click()}
        className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2 text-[11px] font-medium text-white hover:bg-white/10 transition-colors"
      >
        <Upload className="h-3.5 w-3.5" /> {busy ? "Enviando..." : "+ Adicionar Fotos / Vídeos a este Destaque"}
      </button>
    </div>
  );
}
