import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Heart, Send } from "lucide-react";
import { toast } from "sonner";
import { useChefeStore } from "@/lib/chefe-store";
import type { Story } from "@/lib/chefe-store";

interface Props {
  stories: Story[];
  open: boolean;
  onClose: () => void;
  initialIndex?: number;
}

const STORY_DURATION = 15000; // 15 segundos

export function StoriesViewer({ stories, open, onClose, initialIndex = 0 }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const recordStoryInteraction = useChefeStore((s) => s.recordStoryInteraction);

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
    const newLiked = !liked;
    setLiked(newLiked);
    recordStoryInteraction(current.id, "like", newLiked);
    toast.success(newLiked ? "❤️ Você curtiu!" : "Descurtiu o story");
  };

  const handleSendComment = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!comment.trim()) return;

    recordStoryInteraction(current.id, "comment", comment);
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
        className="fixed inset-0 z-[100] flex flex-col bg-black text-white selection:bg-none"
      >
        {/* Barras de Progresso no Topo */}
        <div className="absolute top-3 inset-x-0 z-30 px-3 flex gap-1.5">
          {stories.map((s, i) => (
            <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white"
                initial={{ width: 0 }}
                animate={{
                  width: `${
                    i < index ? 100 : i === index ? progress * 100 : 0
                  }%`,
                }}
                transition={{ duration: 0.05 }}
              />
            </div>
          ))}
        </div>

        {/* Botão Fechar */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onClose}
          className="absolute right-4 top-6 z-30 p-2 rounded-full bg-black/40 text-white backdrop-blur-md hover:bg-black/60 transition"
          aria-label="Fechar stories"
        >
          <X className="h-5 w-5" />
        </motion.button>

        {/* Mídia Principal */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center overflow-hidden">
          {current.mediaType === "video" ? (
            <video
              key={`video-${current.id}`}
              src={current.mediaUrl}
              autoPlay
              playsInline
              controls={false}
              onEnded={goNext}
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              key={`image-${current.id}`}
              src={current.mediaUrl}
              alt={current.caption || "Story"}
              className="h-full w-full object-cover"
            />
          )}

          {/* Áreas de Toque para Navegação */}
          <button
            onClick={goPrev}
            className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer focus:outline-none"
            aria-label="Story anterior"
          />
          <button
            onClick={goNext}
            className="absolute right-0 top-0 bottom-0 w-2/3 z-10 cursor-pointer focus:outline-none"
            aria-label="Próximo story"
          />
        </div>

        {/* Legenda do Story */}
        {current.caption && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-20 inset-x-0 z-20 px-4 text-center pointer-events-none"
          >
            <p className="inline-block rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-md max-w-[85%] break-words">
              {current.caption}
            </p>
          </motion.div>
        )}

        {/* Rodapé de Interações Estilo Instagram */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 inset-x-0 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-center gap-3 z-20"
        >
          <form onSubmit={handleSendComment} className="flex-1">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enviar mensagem..."
              className="w-full bg-transparent border border-white/40 rounded-full px-4 py-2 text-sm text-white placeholder-white/70 focus:outline-none focus:border-white transition"
            />
          </form>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            onClick={handleLike}
            className="p-1 text-white hover:text-red-500 transition"
          >
            <Heart className={`h-7 w-7 ${liked ? "fill-red-500 text-red-500" : ""}`} />
          </motion.button>

          <motion.button
            type="button"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.85 }}
            onClick={() => handleSendComment()}
            disabled={!comment.trim()}
            className="p-1 text-white disabled:opacity-50 transition"
          >
            <Send className="h-6 w-6" />
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
