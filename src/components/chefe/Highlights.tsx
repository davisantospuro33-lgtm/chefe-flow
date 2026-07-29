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

  const viewerStories = useMemo(() => {
    if (openId) return [];
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

  // Trava Cirúrgica: Oculta Destaques se não houver Stories e nem Destaques postados
  const hasContent = stories.length > 0 || highlights.length > 0;
  if (!hasContent) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-2 no-scrollbar">
        {stories.length > 0 && (
          <motion.button
            whileTap={{ scale: 0.94 }}
            onClick={() => setLiveOpen(true)}
            className="flex shrink-0 snap-start flex-col items-center gap-1.5"
          >
            <span className="relative grid h-[74px] w-[74px] place-items-center rounded-full p-[2px] bg-gradient-to-tr from-amber-500 to-emerald-500">
              <span className="absolute inset-0 rounded-full border-2 border-dashed border-emerald-400 animate-spin" style={{ animationDuration: "6s" }} />
              <span className="absolute inset-[2px] rounded-full overflow-hidden bg-slate-950">
                <img src={stories[0]?.mediaUrl} alt="Story" className="h-full w-full object-cover" />
              </span>
            </span>
            <span className="text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
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
            <span className="relative grid h-[74px] w-[74px] place-items-center rounded-full p-[2px] bg-slate-800">
              <span className="absolute inset-[2px] rounded-full overflow-hidden bg-slate-950">
                {h.coverImage ?? highlightMedia.find((m) => m.highlightId === h.id)?.url ? (
                  <img
                    src={h.coverImage ?? highlightMedia.find((m) => m.highlightId === h.id)?.url}
                    alt={h.title || "Destaque"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="relative grid h-full w-full place-items-center text-xs text-slate-500">
                    ✨
                  </span>
                )}
              </span>
            </span>
            {h.title.trim() !== "" && (
              <span className="max-w-[74px] truncate text-[11px] font-medium text-slate-300">
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
