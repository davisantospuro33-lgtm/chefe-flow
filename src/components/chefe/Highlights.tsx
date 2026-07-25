import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Scissors, MapPin, Clock, Layers, Sparkles, ShieldCheck } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";
import { StoriesViewer } from "./StoriesViewer";

const DEFAULT_ITEMS = [
  { id: "cortes", label: "Cortes", icon: Scissors, gradient: "from-fuchsia-500 via-pink-500 to-orange-400" },
  { id: "estrutura", label: "Estrutura", icon: Layers, gradient: "from-cyan-400 via-blue-500 to-indigo-600" },
  { id: "localizacao", label: "Localização", icon: MapPin, gradient: "from-emerald-400 via-teal-500 to-cyan-500" },
  { id: "regras", label: "Regras", icon: ShieldCheck, gradient: "from-amber-400 via-orange-500 to-rose-500" },
  { id: "horarios", label: "Horários", icon: Clock, gradient: "from-violet-500 via-fuchsia-500 to-pink-500" },
  { id: "vibe", label: "Vibe", icon: Sparkles, gradient: "from-lime-400 via-emerald-500 to-teal-500" },
];

export function Highlights() {
  const highlights = useChefeStore((s) => s.highlights);
  const stories = useChefeStore((s) => s.stories);
  const [openIds, setOpenIds] = useState<string[] | null>(null);

  const openHighlight = (storyIds: string[]) => {
    const ordered = storyIds
      .map((id) => stories.find((s) => s.id === id))
      .filter((s): s is (typeof stories)[number] => Boolean(s));
    if (ordered.length === 0) return;
    setOpenIds(ordered.map((s) => s.id));
  };

  const viewerStories = useMemo(
    () =>
      openIds
        ? openIds
            .map((id) => stories.find((s) => s.id === id))
            .filter((s): s is (typeof stories)[number] => Boolean(s))
        : [],
    [openIds, stories],
  );

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-2 scroll-smooth snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpenIds(stories.map((s) => s.id))}
            className="flex shrink-0 snap-start flex-col items-center gap-1.5"
          >
            <span className="relative grid h-[74px] w-[74px] place-items-center">
              <span
                className="absolute inset-0 rounded-full bg-gradient-ig animate-spin"
                style={{ animationDuration: "6s" }}
              />
              <span className="absolute inset-[2px] rounded-full bg-background" />
              <img
                src={stories[0].mediaUrl}
                alt="Story"
                className="relative h-[62px] w-[62px] rounded-full object-cover"
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neon">
              Ao vivo
            </span>
          </motion.button>
        )}

        {highlights.map((h) => (
          <motion.button
            key={h.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => openHighlight(h.storyIds)}
            className="flex shrink-0 snap-start flex-col items-center gap-1.5"
          >
            <span className="relative grid h-[74px] w-[74px] place-items-center">
              <span className="absolute inset-0 rounded-full bg-gradient-ig" />
              <span className="absolute inset-[2px] rounded-full bg-background" />
              {h.coverImage ? (
                <img
                  src={h.coverImage}
                  alt={h.title}
                  className="relative h-[62px] w-[62px] rounded-full object-cover"
                />
              ) : (
                <span className="relative grid h-[62px] w-[62px] place-items-center rounded-full bg-white/5 text-lg">
                  ✨
                </span>
              )}
            </span>
            <span className="max-w-[74px] truncate text-[11px] font-semibold text-foreground/90">
              {h.title}
            </span>
          </motion.button>
        ))}

        {/* Categorias padrão sempre visíveis */}
        {DEFAULT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <motion.button
              key={item.id}
              whileTap={{ scale: 0.94 }}
              className="flex shrink-0 snap-start flex-col items-center gap-1.5"
            >
              <span className="relative grid h-[74px] w-[74px] place-items-center">
                <span
                  className={`absolute inset-0 rounded-full bg-gradient-to-br ${item.gradient}`}
                />
                <span className="absolute inset-[2px] rounded-full bg-background" />
                <span className="relative grid h-[62px] w-[62px] place-items-center rounded-full bg-white/5">
                  <Icon className="h-6 w-6 text-white/90" />
                </span>
              </span>
              <span className="max-w-[74px] truncate text-[11px] font-semibold text-foreground/90">
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <StoriesViewer
        stories={viewerStories}
        open={openIds !== null}
        onClose={() => setOpenIds(null)}
      />
    </>
  );
}