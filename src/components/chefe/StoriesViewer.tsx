import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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

  useEffect(() => {
    if (open) setIndex(initialIndex);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open || stories.length === 0) return;
    if (stories[index]?.mediaType === "video") return; // videos advance on ended
    setProgress(0);
    const start = Date.now();
    const t = setInterval(() => {
      const p = Math.min(1, (Date.now() - start) / STORY_DURATION);
      setProgress(p);
      if (p >= 1) {
        clearInterval(t);
        if (index + 1 >= stories.length) onClose();
        else setIndex((i) => i + 1);
      }
    }, 50);
    return () => clearInterval(t);
  }, [open, index, stories, onClose]);

  if (!open || stories.length === 0) return null;
  const current = stories[index];

  const goPrev = () => setIndex((i) => Math.max(0, i - 1));
  const goNext = () => {
    if (index + 1 >= stories.length) onClose();
    else setIndex((i) => i + 1);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-black"
      >
        {/* Progress bars */}
        <div className="absolute inset-x-0 top-0 z-10 flex gap-1 p-3">
          {stories.map((_, i) => (
            <div key={i} className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/25">
              <div
                className="h-full bg-white transition-[width] duration-100"
                style={{
                  width: `${i < index ? 100 : i === index ? progress * 100 : 0}%`,
                }}
              />
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="absolute right-3 top-6 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/50 text-white"
          aria-label="Fechar"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative h-full w-full">
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
              alt={current.caption ?? "Story"}
              className="h-full w-full object-contain"
            />
          )}

          {/* Tap zones */}
          <button
            onClick={goPrev}
            className="absolute inset-y-0 left-0 z-10 w-1/3"
            aria-label="Anterior"
          />
          <button
            onClick={goNext}
            className="absolute inset-y-0 right-0 z-10 w-2/3"
            aria-label="Próximo"
          />

          {current.caption && (
            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/80 to-transparent px-4 pb-8 pt-16">
              <p className="text-sm font-semibold text-white">{current.caption}</p>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}