imporimport { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Star, X, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useChefeStore } from "@/lib/chefe-store";

export function StoriesViewer() {
  const stories = useChefeStore((s) => s?.stories) ?? [];
  const activeStoryIndex = useChefeStore((s) => s?.activeStoryIndex) ?? null;
  const setActiveStoryIndex = useChefeStore((s) => s?.setActiveStoryIndex);
  
  const [liked, setLiked] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const isOpen = activeStoryIndex !== null && stories.length > 0;
  const currentStory = isOpen ? stories[activeStoryIndex] : null;

  useEffect(() => {
    setLiked(false);
    setRating(0);
    setComment("");
  }, [activeStoryIndex]);

  if (!isOpen || !currentStory) return null;

  const handleNext = () => {
    if (activeStoryIndex < stories.length - 1) {
      setActiveStoryIndex?.(activeStoryIndex + 1);
    } else {
      setActiveStoryIndex?.(null);
    }
  };

  const handlePrev = () => {
    if (activeStoryIndex > 0) {
      setActiveStoryIndex?.(activeStoryIndex - 1);
    }
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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex flex-col bg-black text-white"
      >
        {/* Barras de Progresso Topo */}
        <div className="absolute top-3 inset-x-0 z-20 flex gap-1 px-3">
          {stories.map((s, idx) => (
            <div key={s.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  idx < activeStoryIndex
                    ? "w-full"
                    : idx === activeStoryIndex
                    ? "w-full animate-pulse"
                    : "w-0"
                }`}
              />
            </div>
          ))}
        </div>

        {/* Cabeçalho do Story */}
        <div className="absolute top-6 inset-x-0 z-20 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
              <div className="h-full w-full rounded-full bg-black overflow-hidden">
                <img src="/avatar-chefe.png" alt="Chefe" className="h-full w-full object-cover" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold leading-none">Comando CHEFE</p>
              <p className="text-[10px] text-zinc-400">Há alguns minutos</p>
            </div>
          </div>
          <button
            onClick={() => setActiveStoryIndex?.(null)}
            className="rounded-full bg-black/40 p-2 backdrop-blur-md hover:bg-black/60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mídia Principal em Tela Cheia */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-black">
          {currentStory.mediaType === "video" ? (
            <video
              src={currentStory.mediaUrl}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
              onEnded={handleNext}
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt=""
              className="h-full w-full object-contain"
            />
          )}

          {/* Navegação por Toque Lateral */}
          <div onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10" />
          <div onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10" />
        </div>

        {/* Legenda do Story */}
        {currentStory.caption && (
          <div className="absolute bottom-20 inset-x-0 z-20 px-4 text-center">
            <p className="rounded-xl bg-black/60 px-3 py-2 text-xs font-medium backdrop-blur-md border border-white/10 inline-block">
              {currentStory.caption}
            </p>
          </div>
        )}

        {/* Rodapé de Interações (Curtida, Estrelas e Comentário) */}
        <div className="absolute bottom-0 inset-x-0 z-20 p-4 bg-gradient-to-t from-black via-black/80 to-transparent space-y-3">
          {/* Avaliação por Estrelas */}
          <div className="flex justify-center items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => {
                  setRating(star);
                  toast.success(`Você avaliou com ${star} estrela(s)!`);
                }}
                className="transition-transform active:scale-125"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= rating ? "fill-amber-400 text-amber-400" : "text-white/40"
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Comentário e Curtida */}
          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              type="text"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enviar mensagem ao Chefe..."
              className="flex-1 rounded-full bg-white/10 border border-white/20 px-4 py-2.5 text-xs text-white placeholder:text-zinc-400 focus:outline-none focus:border-amber-500 backdrop-blur-md"
            />
            <button
              type="button"
              onClick={() => {
                setLiked(!liked);
                toast.success(!liked ? "Você curtiu o story!" : "Curtida removida");
              }}
              className="p-2.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md active:scale-110 transition-transform"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-rose-500 text-rose-500" : "text-white"}`} />
            </button>
            <button
              type="submit"
              className="p-2.5 rounded-full bg-amber-500 text-black font-bold"
            >
              <MessageCircle className="h-5 w-5" />
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
