import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Star, Send } from "lucide-react";
import { toast } from "sonner";
import type { Story } from "@/lib/chefe-store";

interface Props {
  stories: Story[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const STORY_DURATION = 5000;

export function StoriesViewer({ stories, open, onClose, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setIndex(initialIndex);
      setProgress(0);
      setLiked(false);
      setRating(0);
      setComment("");
    }
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open || !stories.length) return;
    if (stories[index]?.mediaType === "video") return;

    setProgress(0);
    const start = Date.now();
    const interval = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / STORY_DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(interval);
        if (index + 1 < stories.length) {
          setIndex((i) => i + 1);
        } else {
          onClose();
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [open, index, stories, onClose]);

  if (!open || !stories.length) return null;
  const current = stories[index];
  if (!current) return null;

  const goPrev = () => {
    setIndex((i) => Math.max(0, i - 1));
    setProgress(0);
  };

  const goNext = () => {
    if (index + 1 < stories.length) {
      setIndex((i) => i + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    toast.success("Comentário enviado!");
    setComment("");
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black text-white"
      >
        {/* Barras de Progresso no Topo */}
        <div className="absolute top-3 inset-x-0 z-20 flex gap-1 px-3">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className="h-full bg-white transition-all duration-75"
                style={{
                  width: `${
                    i < index ? 100 : i === index ? (s.mediaType === "video" ? 100 : progress * 100) : 0
                  }%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute right-4 top-6 z-30 rounded-full bg-black/40 p-2 backdrop-blur-md"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Mídia Principal */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
          {current.mediaType === "video" ? (
            <video
              key={current.id}
              src={current.mediaUrl}
              autoPlay
              playsInline
              controls={false}
              onEnded={goNext}
              className="h-full w-full object-contain"
            />
          ) : (
            <img
              key={current.id}
              src={current.mediaUrl}
              alt={current.caption || "Story"}
              className="h-full w-full object-contain"
            />
          )}

          {/* Áreas de Toque para Voltar/Avançar */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 bottom-24 w-1/3 z-10 opacity-0"
            aria-label="Anterior"
          />
          <button
            onClick={goNext}
            className="absolute right-0 top-0 bottom-24 w-1/3 z-10 opacity-0"
            aria-label="Próximo"
          />
        </div>

        {/* Legenda do Story */}
        {current.caption && (
          <div className="absolute bottom-24 inset-x-0 z-20 px-4 text-center">
            <p className="inline-block rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10">
              {current.caption}
            </p>
          </div>
        )}

        {/* Rodapé de Interações (Curtida, Avaliação com Estrelas e Comentário) */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black via-black/90 to-transparent space-y-2">
          {/* Avaliação com 5 Estrelas */}
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  toast.success(`Avaliado em ${star} estrela(s)!`);
                }}
                className="transition-transform active:scale-125"
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= rating ? "fill-amber-400 text-amber-400" : "text-white/40"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Campo de Resposta e Curtida */}
          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enviar mensagem..."
              className="flex-1 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 backdrop-blur-md"
            />
            <button
              type="button"
              onClick={() => {
                setLiked(!liked);
                toast.success(!liked ? "Você curtiu o story!" : "Curtida removida");
              }}
              className="p-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md active:scale-110 transition-transform"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-rose-500 text-rose-500" : "text-white"}`} />
            </button>
            <button
              type="submit"
              className="p-2 rounded-full bg-amber-500 text-black font-bold"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
