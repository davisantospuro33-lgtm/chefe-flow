import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Star, Send } from "lucide-react";
import { toast } from "sonner";
import { useChefeStore } from "@/lib/chefe-store";
import type { Story } from "@/lib/chefe-store";

interface Props {
  stories: Story[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const STORY_DURATION = 15000; // 15 segundos para imagens

export function StoriesViewer({ stories, open, onClose, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const recordStoryInteraction = useChefeStore((s) => s.recordStoryInteraction);
  const startChatFromStory = useChefeStore((s) => s.startChatFromStory);

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

  const handleLike = () => {
    setLiked(!liked);
    recordStoryInteraction(current.id, "like", !liked);
    toast.success(!liked ? "❤️ Você curtiu!" : "Curtida removida");
  };

  const handleRating = (star: number) => {
    setRating(star);
    recordStoryInteraction(current.id, "rating", star);
    toast.success(`⭐ Avaliado em ${star} estrela(s)!`);
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    recordStoryInteraction(current.id, "comment", comment);
    startChatFromStory(current.id, comment);
    toast.success("💬 Mensagem enviada ao Chefe!");
    setComment("");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="stories-viewer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex flex-col bg-black text-white"
      >
        {/* Barras de Progresso no Topo */}
        <div className="absolute top-3 inset-x-0 z-20 flex gap-1 px-3 pointer-events-none">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    i < index ? 100 : i === index ? (s.mediaType === "video" ? 100 : progress * 100) : 0
                  }%`,
                }}
                transition={{ duration: 0.075 }}
              />
            </div>
          ))}
        </div>

        {/* Botão Fechar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="absolute right-4 top-6 z-30 rounded-full bg-black/40 p-2 backdrop-blur-md hover:bg-black/60 transition-colors"
          aria-label="Fechar stories"
        >
          <X className="h-5 w-5" />
        </motion.button>

        {/* Mídia Principal */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black select-none">
          {current.mediaType === "video" ? (
            <video
              key={`video-${current.id}`}
              src={current.mediaUrl}
              autoPlay
              playsInline
              controls={false}
              onEnded={goNext}
              className="h-full w-full object-contain pointer-events-none"
            />
          ) : (
            <img
              key={`image-${current.id}`}
              src={current.mediaUrl}
              alt={current.caption || "Story"}
              className="h-full w-full object-contain pointer-events-none"
            />
          )}

          {/* Áreas de Toque para Navegação */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 bottom-24 w-1/3 z-10"
            aria-label="Story anterior"
          />
          <button
            onClick={goNext}
            className="absolute right-0 top-0 bottom-24 w-1/3 z-10"
            aria-label="Próximo story"
          />
        </div>

        {/* Legenda do Story */}
        {current.caption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-24 inset-x-0 z-20 px-4 text-center pointer-events-none"
          >
            <p className="inline-block rounded-xl bg-black/60 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md border border-white/10">
              {current.caption}
            </p>
          </motion.div>
        )}

        {/* Rodapé de Interações */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 inset-x-0 z-20 p-3 bg-gradient-to-t from-black via-black/90 to-transparent space-y-2"
        >
          {/* Avaliação com 5 Estrelas */}
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={`star-${star}`}
                type="button"
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.85 }}
                onClick={() => handleRating(star)}
                className="transition-transform"
              >
                <Star
                  className={`h-5 w-5 ${
                    star <= rating ? "fill-amber-400 text-amber-400" : "text-white/40"
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Campo de Resposta e Curtida */}
          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <motion.input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enviar mensagem..."
              className="flex-1 rounded-full bg-white/10 border border-white/20 px-4 py-2 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 backdrop-blur-md transition-colors"
              whileFocus={{ backgroundColor: "rgba(255, 255, 255, 0.15)" }}
            />
            <motion.button
              type="button"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              onClick={handleLike}
              className="p-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md transition-all hover:border-rose-400/50"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-rose-500 text-rose-500" : "text-white"}`} />
            </motion.button>
            <motion.button
              type="submit"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.85 }}
              disabled={!comment.trim()}
              className="p-2 rounded-full bg-blue-600 text-white font-bold transition-opacity disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
