import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, Trash2, Plus, Film, X } from "lucide-react";
import { toast } from "sonner";
import { useChefeStore } from "@/lib/chefe-store";

export function StoriesManager() {
  const stories = useChefeStore((s) => s.stories);
  const highlights = useChefeStore((s) => s.highlights);
  const uploadStory = useChefeStore((s) => s.uploadStory);
  const deleteStory = useChefeStore((s) => s.deleteStory);
  const createHighlight = useChefeStore((s) => s.createHighlight);
  const deleteHighlight = useChefeStore((s) => s.deleteHighlight);
  const uploadHighlightMedia = useChefeStore((s) => s.uploadHighlightMedia);
  const deleteHighlightMedia = useChefeStore((s) => s.deleteHighlightMedia);
  const uploadHighlightCover = useChefeStore((s) => s.uploadHighlightCover);

  const storyFileInput = useRef<HTMLInputElement>(null);
  const highlightFileInput = useRef<HTMLInputElement>(null);
  const highlightCoverInput = useRef<HTMLInputElement>(null);

  const [storyCaption, setStoryCaption] = useState("");
  const [storyMediaType, setStoryMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const [newHighlightTitle, setNewHighlightTitle] = useState("");
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null);

  // Handle story upload
  const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await uploadStory(file, storyCaption);
      toast.success("Story publicado com sucesso!");
      setStoryCaption("");
      setStoryMediaType("image");
      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Erro ao publicar story");
    } finally {
      setUploading(false);
    }
  };

  // Handle story deletion
  const handleDeleteStory = async (id: string, storagePath: string | null) => {
    if (!confirm("Excluir este story?")) return;
    try {
      await deleteStory(id, storagePath);
      toast.success("Story excluído");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir story");
    }
  };

  // Handle create highlight
  const handleCreateHighlight = async () => {
    if (!newHighlightTitle.trim()) {
      toast.error("Digite um título para o destaque");
      return;
    }
    setUploading(true);
    try {
      const id = await createHighlight(newHighlightTitle);
      if (id) {
        setSelectedHighlightId(id);
        setNewHighlightTitle("");
        toast.success("Destaque criado!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Erro ao criar destaque");
    } finally {
      setUploading(false);
    }
  };

  // Handle delete highlight
  const handleDeleteHighlight = async (id: string) => {
    if (!confirm("Excluir este destaque?")) return;
    try {
      await deleteHighlight(id);
      toast.success("Destaque excluído");
      if (selectedHighlightId === id) setSelectedHighlightId(null);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir destaque");
    }
  };

  // Handle highlight media upload
  const handleHighlightMediaUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHighlightId) return;

    setUploading(true);
    try {
      await uploadHighlightMedia(selectedHighlightId, file);
      toast.success("Mídia adicionada ao destaque!");
      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Erro ao adicionar mídia");
    } finally {
      setUploading(false);
    }
  };

  // Handle highlight cover upload
  const handleHighlightCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedHighlightId) return;

    setUploading(true);
    try {
      await uploadHighlightCover(selectedHighlightId, file);
      toast.success("Capa do destaque atualizada!");
      e.target.value = "";
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar capa");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Stories Section */}
      <section className="glass rounded-3xl p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          📸 Stories · Ao Vivo
        </p>

        {/* New Story Form */}
        <div className="mb-4 space-y-3 rounded-2xl bg-white/[0.02] p-4 border border-white/10">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Legenda do Story
            </label>
            <input
              type="text"
              value={storyCaption}
              onChange={(e) => setStoryCaption(e.target.value)}
              placeholder="Escreva uma legenda (opcional)"
              className="w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-foreground outline-none ring-1 ring-border transition placeholder:text-muted-foreground/60 focus:ring-neon/60"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Tipo de Mídia
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setStoryMediaType("image")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  storyMediaType === "image"
                    ? "bg-gradient-ig text-white"
                    : "bg-white/[0.05] text-muted-foreground"
                }`}
              >
                📷 Imagem
              </button>
              <button
                onClick={() => setStoryMediaType("video")}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold transition ${
                  storyMediaType === "video"
                    ? "bg-gradient-ig text-white"
                    : "bg-white/[0.05] text-muted-foreground"
                }`}
              >
                🎬 Vídeo
              </button>
            </div>
          </div>

          <input
            ref={storyFileInput}
            type="file"
            accept={storyMediaType === "image" ? "image/*" : "video/*"}
            onChange={handleStoryUpload}
            className="hidden"
          />

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={uploading}
            onClick={() => storyFileInput.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            <Upload className="h-4 w-4" />
            {uploading ? "Publicando..." : "Publicar Story"}
          </motion.button>
        </div>

        {/* Stories List */}
        {stories.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
            Nenhum story publicado. Publica um para começar!
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {stories.map((story) => (
              <div
                key={story.id}
                className="group relative aspect-square overflow-hidden rounded-lg border border-white/10"
              >
                {story.mediaType === "video" ? (
                  <video
                    src={story.mediaUrl}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={story.mediaUrl}
                    alt={story.caption || "Story"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                )}
                {story.mediaType === "video" && (
                  <span className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-1">
                    <Film className="h-3 w-3" />
                  </span>
                )}
                {story.caption && (
                  <span className="absolute bottom-1 left-1 right-1 rounded bg-black/60 px-2 py-1 text-[9px] font-semibold text-white truncate">
                    {story.caption}
                  </span>
                )}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDeleteStory(story.id, story.storagePath)}
                  className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/60 group-hover:opacity-100"
                >
                  <Trash2 className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Highlights Section */}
      <section className="glass rounded-3xl p-5">
        <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          ✨ Destaques · Fixos
        </p>

        {/* Create New Highlight */}
        <div className="mb-4 space-y-3 rounded-2xl bg-white/[0.02] p-4 border border-white/10">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
              Título do Destaque
            </label>
            <input
              type="text"
              value={newHighlightTitle}
              onChange={(e) => setNewHighlightTitle(e.target.value)}
              placeholder="Ex: Cortes Premium, Events, etc"
              className="w-full rounded-xl bg-white/[0.04] px-3 py-2.5 text-sm text-foreground outline-none ring-1 ring-border transition placeholder:text-muted-foreground/60 focus:ring-neon/60"
            />
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            disabled={uploading}
            onClick={handleCreateHighlight}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-ig px-4 py-3 text-sm font-black text-white disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {uploading ? "Criando..." : "Criar Destaque"}
          </motion.button>
        </div>

        {/* Highlights List */}
        {highlights.length === 0 ? (
          <p className="rounded-2xl bg-white/[0.03] px-4 py-6 text-center text-xs text-muted-foreground">
            Nenhum destaque criado. Cria um para começar!
          </p>
        ) : (
          <div className="space-y-2">
            {highlights.map((highlight) => (
              <div
                key={highlight.id}
                className="rounded-2xl bg-white/[0.02] p-3 border border-white/10 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold truncate">{highlight.title}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {highlight.storyIds.length} story{highlight.storyIds.length !== 1 ? "s" : ""} vinculado{highlight.storyIds.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDeleteHighlight(highlight.id)}
                    className="p-2 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500/30"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>

                {selectedHighlightId === highlight.id && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-white/10">
                    <div className="flex gap-2">
                      <input
                        ref={highlightCoverInput}
                        type="file"
                        accept="image/*"
                        onChange={handleHighlightCoverUpload}
                        className="hidden"
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        disabled={uploading}
                        onClick={() => highlightCoverInput.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-amber-500/20 px-3 py-2 text-xs font-bold text-amber-400 hover:bg-amber-500/30 disabled:opacity-50"
                      >
                        <Upload className="h-3 w-3" />
                        Capa
                      </motion.button>

                      <input
                        ref={highlightFileInput}
                        type="file"
                        accept="image/*,video/*"
                        onChange={handleHighlightMediaUpload}
                        className="hidden"
                      />
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        disabled={uploading}
                        onClick={() => highlightFileInput.current?.click()}
                        className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-sky-500/20 px-3 py-2 text-xs font-bold text-sky-400 hover:bg-sky-500/30 disabled:opacity-50"
                      >
                        <Upload className="h-3 w-3" />
                        Mídia
                      </motion.button>
                    </div>
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() =>
                    setSelectedHighlightId(
                      selectedHighlightId === highlight.id ? null : highlight.id
                    )
                  }
                  className="mt-2 w-full rounded-lg bg-white/5 px-3 py-2 text-xs font-bold text-foreground hover:bg-white/10"
                >
                  {selectedHighlightId === highlight.id ? "Fechar" : "Adicionar Mídia"}
                </motion.button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
