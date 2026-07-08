import { Star } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function Reviews() {
  const reviews = useChefeStore((s) => s.reviews);
  if (reviews.length === 0) return null;
  return (
    <section>
      <div className="mb-2 flex items-center justify-center gap-2 border-t border-border pt-3 text-muted-foreground">
        <Star className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest">Depoimentos</span>
      </div>
      <div className="space-y-2.5">
        {reviews.map((r) => (
          <article
            key={r.id}
            className="rounded-2xl glass p-4"
          >
            <header className="mb-1 flex items-center justify-between">
              <p className="text-sm font-black">{r.name}</p>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.round(r.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </header>
            <p className="text-xs leading-relaxed text-muted-foreground">
              "{r.comment}"
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}