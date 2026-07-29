import React, { useMemo, useState } from 'react'
import { Grid, Video, Play, X, ChevronDown } from 'lucide-react'
import { useChefeStore } from '@/lib/chefe-store'
import type { PortfolioItem } from '@/lib/chefe-store'

export function PostsReelsCarousel() {
  const portfolio = useChefeStore((s) => s.portfolio)
  const [tab, setTab] = useState<'posts' | 'reels'>('posts')
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState<PortfolioItem | null>(null)

  const posts = useMemo(
    () => (portfolio ?? []).filter((p) => p.mediaType === 'image'),
    [portfolio],
  )
  const reels = useMemo(
    () => (portfolio ?? []).filter((p) => p.mediaType === 'video'),
    [portfolio],
  )

  // Sanfona/oculta: sem publicações ativas, a seção some por completo
  if (posts.length === 0 && reels.length === 0) return null

  const items = tab === 'posts' ? posts : reels

  return (
    <section className="w-full space-y-3">
      {/* Abas (apenas ícones) */}
      <div className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-1 backdrop-blur">
        <div className="flex flex-1">
          <button
            onClick={() => {
              setTab('posts')
              setOpen(true)
            }}
            aria-label="Posts"
            className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2 transition-all ${
              tab === 'posts'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid className="h-4 w-4" />
            <span className="text-[10px] font-bold">{posts.length}</span>
          </button>
          <button
            onClick={() => {
              setTab('reels')
              setOpen(true)
            }}
            aria-label="Reels"
            className={`flex flex-1 items-center justify-center gap-1 rounded-xl py-2 transition-all ${
              tab === 'reels'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Video className="h-4 w-4" />
            <span className="text-[10px] font-bold">{reels.length}</span>
          </button>
        </div>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Recolher mídias"
          className="mx-1 grid h-8 w-8 place-items-center rounded-xl text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform ${open ? '' : '-rotate-90'}`}
          />
        </button>
      </div>

      {/* Carrossel horizontal */}
      {open && (
        <div className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2">
          {items.length === 0 ? (
            <p className="px-1 py-4 text-[11px] text-muted-foreground">
              Nenhuma publicação nesta aba ainda.
            </p>
          ) : (
            items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="group relative h-56 w-40 flex-shrink-0 snap-start overflow-hidden rounded-2xl border border-border bg-card shadow-lg transition-transform active:scale-95"
              >
                {item.mediaType === 'video' ? (
                  <video
                    src={item.url}
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <img
                    src={item.url}
                    alt="Publicação do CHEFE"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                {item.mediaType === 'video' && (
                  <span className="absolute inset-0 grid place-items-center">
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-black/60 text-white backdrop-blur">
                      <Play className="ml-0.5 h-5 w-5 fill-current" />
                    </span>
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {/* Visualização ampliada */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
            <button
              onClick={() => setSelected(null)}
              aria-label="Fechar"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-black/70 text-white backdrop-blur"
            >
              <X className="h-4 w-4" />
            </button>
            {selected.mediaType === 'video' ? (
              <video src={selected.url} controls autoPlay className="max-h-[70vh] w-full bg-black" />
            ) : (
              <img src={selected.url} alt="Publicação" className="max-h-[70vh] w-full object-contain bg-black" />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
