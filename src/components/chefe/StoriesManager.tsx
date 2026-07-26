import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Star, X } from "lucide-react";
import { toast } from "sonner";
import type { Story } from "@/lib/chefe-store";

interface StoriesManagerProps {
  stories: Story[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const STORY_DURATION = 5000; // 5 segundos por story de imagem

export function StoriesManager({
  stories,
  open,
  onClose,
  initialIndex = 0,
}: StoriesManagerProps) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  // Reinicia estado quando abre/fecha ou muda índice inicial
  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setProgress(0);
      setLiked(false);
      setRating(0);
      setComment("");
    }
  }, [open, initialIndex]);

  // Auto-avança stories de imagem após STORY_DURATION
  useEffect(() => {
    if (!open || !stories.length) return;
    const currentStory = stories[index];
    if (!currentStory) return;

    // Pula lógica de auto-avance para vídeos
    if (currentStory.mediaType === "video") return;

    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(1, elapsed / STORY_DURATION);
      setProgress(p);

      if (p >= 1) {
        clearInterval(interval);
        // Avança para próximo story ou fecha viewer
        if (index + 1 < stories.length) {
          setIndex((prev) => prev + 1);
        } else {
          onClose();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [open, index, stories, onClose]);

  if (!open || !stories.length) return null;

  const currentStory = stories[index];
  if (!currentStory) return null;

  const handlePrevious = () => {
    if (index > 0) {
      setIndex(index - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (index + 1 < stories.length) {
      setIndex(index + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleVideoEnded = () => {
    handleNext();
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    toast.success("Comentário enviado para o Chefe!");
    setComment("");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="stories-manager"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black text-white"
      >
        {/* Barras de Progresso no Topo */}
        <div className="absolute top-3 inset-x-0 z-20 flex gap-1 px-3">
          {stories.map((s, idx) => (
            <div
              key={s.id}
              className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
            >
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: `${
                    idx < index
                      ? 100
                      : idx === index
                        ? s.mediaType === "video"
                          ? 100
                          : progress * 100
                        : 0
                  }%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-6 z-30 rounded-full bg-black/40 p-2 backdrop-blur-md hover:bg-black/60 transition-colors"
          aria-label="Fechar stories"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Mídia Principal em Tela Cheia */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black overflow-hidden">
          {currentStory.mediaType === "video" ? (
            <video
              key={`video-${currentStory.id}`}
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              controls={false}
              onEnded={handleVideoEnded}
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              key={`image-${currentStory.id}`}
              src={currentStory.mediaUrl}
              alt={currentStory.caption || "Story"}
              className="h-full w-full object-contain"
            />
          )}

          {/* Áreas de Toque para Navegação */}
          <button
            onClick={handlePrevious}
            className="absolute left-0 top-0 bottom-24 w-1/3 z-10"
            aria-label="Story anterior"
          />
          <button
            onClick={handleNext}
            className="absolute right-0 top-0 bottom-24 w-1/3 z-10"
            aria-label="Próximo story"
          />
        </div>

        {/* Legenda do Story */}
        {currentStory.caption && (
          <div className="absolute bottom-24 inset-x-0 z-20 px-4 text-center">
            <p className="inline-block rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Rodapé de Interações */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-3">
          {/* Avaliação com 5 Estrelas */}
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={`star-${star}`}
                type="button"
                onClick={() => {
                  setRating(star);
                  toast.success(`Avaliado com ${star} estrela(s)!`);
                }}
                className="transition-transform active:scale-125"
                aria-label={`Avaliar ${star} estrela(s)`}
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-white/40"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Campo de Comentário e Curtida */}
          <form
            onSubmit={handleSendComment}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enviar mensagem ao Chefe..."
              className="flex-1 rounded-full bg-white/10 border border-white/20 px-4 py-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 backdrop-blur-md transition-colors"
            />
            <button
              type="button"
              onClick={() => {
                setLiked(!liked);
                toast.success(
                  !liked
                    ? "Você curtiu o story!"
                    : "Curtida removida"
                );
              }}
              className="p-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md active:scale-110 transition-transform"
              aria-label="Curtir story"
            >
              <Heart
                className={`h-5 w-5 ${
                  liked
                    ? "fill-rose-500 text-rose-500"
                    : "text-white"
                }`}
              />
            </button>
            <button
              type="submit"
              className="p-2.5 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-600 transition-colors"
              aria-label="Enviar comentário"
            >
              ✓
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
