import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useChefeStore, type Story } from "@/lib/chefe-store";
import { StoriesViewer } from "./StoriesViewer";

// Referência estável para evitar recomputação dos useMemo quando o store
// retornar null/undefined em algum momento (fallback array seguro).
const EMPTY_ARR: never[] = [];

export function Highlights() {
  const highlightsRaw = useChefeStore((s) => s.highlights);
  const highlightMediaRaw = useChefeStore((s) => s.highlightMedia);
  const storiesRaw = useChefeStore((s) => s.stories);
  const highlights = highlightsRaw ?? EMPTY_ARR;
  const highlightMedia = highlightMediaRaw ?? EMPTY_ARR;
  const stories = storiesRaw ?? EMPTY_ARR;
  const [openId, setOpenId] = useState<string | null>(null);
  const [liveOpen, setLiveOpen] = useState(false);

  const viewerStories = useMemo<Story[]>(() => {
    if (!openId) return [];
    const album = (highlightMedia ?? [])
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
    const h = (highlights ?? []).find((x) => x.id === openId);
    return (h?.storyIds ?? [])
      .map((id) => (stories ?? []).find((s) => s.id === id))
      .filter((s): s is Story => Boolean(s));
  }, [openId, highlightMedia, highlights, stories]);

  // Só considera "válido" um destaque que tenha mídia real:
  // capa, ao menos uma foto/vídeo no álbum, ou stories vinculados existentes.
  // Isso elimina a "bolha amarela vazia/quebrada".
  const visibleHighlights = useMemo(
    () =>
      (highlights ?? []).filter((h) => {
        if (!h) return false;
        const hasCover = Boolean(h.coverImage);
        const hasMedia = (highlightMedia ?? []).some((m) => m.highlightId === h.id);
        const hasStories = (h.storyIds ?? []).some((id) =>
          (stories ?? []).some((s) => s.id === id),
        );
        return hasCover || hasMedia || hasStories;
      }),
    [highlights, highlightMedia, stories],
  );

  const hasLive = (stories ?? []).length > 0;

  // Se não há stories ao vivo NEM destaques válidos, oculta a seção inteira.
  if (!hasLive && visibleHighlights.length === 0) return null;

  return (
    <>
      <div className="flex gap-4 overflow-x-auto py-2 scroll-smooth snap-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hasLive && (
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
                src={stories[0]?.mediaUrl}
                alt="Story"
                className="relative h-[62px] w-[62px] rounded-full object-cover"
              />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-neon">
              Ao vivo
            </span>
          </motion.button>
        )}

        {visibleHighlights.map((h) => (
          <motion.button
            key={h.id}
            whileTap={{ scale: 0.94 }}
            onClick={() => setOpenId(h.id)}
            className="flex shrink-0 snap-start flex-col items-center gap-1.5"
          >
            <span className="relative grid h-[74px] w-[74px] place-items-center">
              <span className="absolute inset-0 rounded-full bg-gradient-ig" />
              <span className="absolute inset-[2px] rounded-full bg-background" />
              {(() => {
                const cover =
                  h.coverImage ??
                  (highlightMedia ?? []).find(
                    (m) => m.highlightId === h.id && m.mediaType === "image",
                  )?.url;
                return cover ? (
                  <img
                    src={cover || "/placeholder.svg"}
                    alt={(h.title ?? "").trim() || "Destaque"}
                    className="relative h-[62px] w-[62px] rounded-full object-cover"
                  />
                ) : (
                  <span className="relative grid h-[62px] w-[62px] place-items-center rounded-full bg-white/5 text-lg">
                    ✨
                  </span>
                );
              })()}
            </span>
            {(h.title ?? "").trim() !== "" && (
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
      <StoriesViewer stories={stories} open={liveOpen} onClose={() => setLiveOpen(false)} />
    </>
  );
}
