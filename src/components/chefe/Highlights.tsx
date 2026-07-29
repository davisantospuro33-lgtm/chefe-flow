import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useChefeStore, type Story } from "@/lib/chefe-store";
import { StoriesViewer } from "./StoriesViewer";

export function Highlights() {
  const highlights = useChefeStore((s) => s.highlights);
  const highlightMedia = useChefeStore((s) => s.highlightMedia);
  const stories = useChefeStore((s) => s.stories);
  const [openId, setOpenId] = useState<string | null>(null);
  const [liveOpen, setLiveOpen] = useState(false);

  const viewerStories = useMemo<Story[]>(() => {
    if (!openId) return [];
    const album = highlightMedia
      .filter((m) => m.highlightId === openId)
      .sort((a, b) => a.position - b.position)
      .map((m) => ({
        id: m.id,
        mediaUrl: m.url,
        mediaType: m.mediaType,
        storagePath: m.storagePath,
        caption: null,
        createdAt: 0,
        expiresAt: 0,
      }));
    if (album.length > 0) return album;
    const h = highlights.find((x) => x.id === openId);
    return (h?.storyIds ?? [])
      .map((id) => stories.find((s) => s.id === id))
      .filter((s): s is Story => Boolean(s));
  }, [openId, highlightMedia, highlights, stories]);

  if (highlights.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-2 scroll-smooth snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {stories.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setLiveOpen(true)}
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
            onClick={() => setOpenId(h.id)}
            className="flex shrink-0 snap-start flex-col items-center gap-1.5"
          >
            <span className="relative grid h-[74px] w-[74px] place-items-center">
              <span className="absolute inset-0 rounded-full bg-gradient-ig" />
              <span className="absolute inset-[2px] rounded-full bg-background" />
              {(h.coverImage ??
                highlightMedia.find((m) => m.highlightId === h.id && m.mediaType === "image")
                  ?.url) ? (
                <img
                  src={
                    h.coverImage ??
                    highlightMedia.find(
                      (m) => m.highlightId === h.id && m.mediaType === "image",
                    )!.url
                  }
                  alt={h.title || "Destaque"}
                  className="relative h-[62px] w-[62px] rounded-full object-cover"
                />
              ) : (
                <span className="relative grid h-[62px] w-[62px] place-items-center rounded-full bg-white/5 text-lg">
                  ✨
                </span>
              )}
            </span>
            {h.title.trim() !== "" && (
              <span className="max-w-[74px] truncate text-[11px] font-semibold text-foreground/90">
                {h.title}
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <StoriesViewer
        stories={viewerStories}
        open={openId !== null && viewerStories.length > 0}
        onClose={() => setOpenId(null)}
      />
      <StoriesViewer
        stories={stories}
        open={liveOpen}
        onClose={() => setLiveOpen(false)}
      />
    </>
  );
}