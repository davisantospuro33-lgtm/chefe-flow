import { useMemo, useState } from "react";
import { Grid, Video, Play } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function PostsReelsCarousel() {
  const portfolio = useChefeStore((s) => s.portfolio);
  const [tab, setTab] = useState<"posts" | "reels">("posts");

  const posts = useMemo(
    () => portfolio.filter((p) => p.mediaType === "image"),
    [portfolio],
  );
  const reels = useMemo(
    () => portfolio.filter((p) => p.mediaType === "video"),
    [portfolio],
  );

  if (posts.length === 0 && reels.length === 0) return null;

  const active = tab === "posts" ? posts : reels;

  return (
    <section className="mt-2 px-4">
      <div className="mb-3 flex border-b border-border">
        <button
          onClick={() => setTab("posts")}
          disabled={posts.length === 0}
          aria-label="Posts"
          title="Posts"
          className={`flex flex-1 items-center justify-center border-b-2 py-2.5 transition-all disabled:opacity-30 ${
            tab === "posts"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          <Grid size={22} />
        </button>
        <button
          onClick={() => setTab("reels")}
          disabled={reels.length === 0}
          aria-label="Reels"
          title="Reels"
          className={`flex flex-1 items-center justify-center border-b-2 py-2.5 transition-all disabled:opacity-30 ${
            tab === "reels"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          }`}
        >
          <Video size={22} />
        </button>
      </div>

      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1 snap-x">
        {active.map((item) => (
          <div
            key={item.id}
            className={`relative shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-muted ${
              tab === "reels" ? "aspect-[9/16] w-32" : "aspect-square w-32"
            }`}
          >
            {item.mediaType === "video" ? (
              <>
                <video
                  src={item.url}
                  muted
                  playsInline
                  preload="metadata"
                  className="h-full w-full object-cover"
                />
                <Play
                  size={16}
                  className="absolute right-2 top-2 fill-foreground text-foreground drop-shadow"
                />
              </>
            ) : (
              <img
                src={item.url}
                alt="Mídia do CHEFE"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}