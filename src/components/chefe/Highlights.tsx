import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useChefeStore } from "@/lib/chefe-store";
import { StoriesViewer } from "./StoriesViewer";

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

  if (highlights.length === 0) return null;

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
      </div>

      <StoriesViewer
        stories={viewerStories}
        open={openIds !== null}
        onClose={() => setOpenIds(null)}
      />
    </>
  );
}