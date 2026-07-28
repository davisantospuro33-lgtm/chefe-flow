import React, { useState } from 'react'
import { useChefeStore } from '@/lib/chefe-store'
import { Play, Film, Image as ImageIcon, Heart, Sparkles, X } from 'lucide-react'

export interface PortfolioItem {
  id: string
  type: 'image' | 'reel'
  title: string
  mediaUrl: string
  likes?: number
  category?: string
  createdAt?: string
}

export function PostsReelsCarousel() {
  // Sincronização direta com a Store Global do Painel do CHEFE
  const storePortfolio = useChefeStore((s) => (s as any).portfolio) as PortfolioItem[] | undefined

  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null)
  const [likedItems, setLikedItems] = useState<Record<string, boolean>>({})

  // Postagens padrão (fallback caso nenhuma postagem tenha sido criada no Painel ainda)
  const fallbackItems: PortfolioItem[] = [
    {
      id: 'fb-1',
      type: 'reel',
      title: 'Fade Americano + Risco na Navalha',
      mediaUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
      likes: 184,
      category: 'Cortes'
    },
    {
      id: 'fb-2',
      type: 'image',
      title: 'Alinhamento Barba Premium & Visagismo',
      mediaUrl: 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=600&q=80',
      likes: 129,
      category: 'Barba'
    },
    {
      id: 'fb-3',
      type: 'reel',
      title: 'Transformação Completa - Estilo CHEFE',
      mediaUrl: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?auto=format&fit=crop&w=600&q=80',
      likes: 245,
      category: 'Resenha'
    }
  ]

  // Se houver posts/reels no Painel de Controle, usa os dados reais; caso contrário, exibe os de exemplo.
  const displayItems: PortfolioItem[] = storePortfolio && storePortfolio.length > 0 
    ? storePortfolio 
    : fallbackItems

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setLikedItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div className="w-full space-y-3 my-2">
      {/* Cabeçalho do Carrossel */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
            Feed & Reels do CHEFE
          </h3>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground animate-pulse">
          Arraste pro lado →
        </span>
      </div>

      {/* Carrossel Flutuante Horizontal */}
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2 pt-1 snap-x snap-mandatory">
        {displayItems.map((item) => {
          const isLiked = likedItems[item.id]

          return (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="group relative h-56 w-40 snap-start flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-border/60 bg-card shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-emerald-500/50"
            >
              {/* Mídia / Thumbnail */}
              <img
                src={item.mediaUrl}
                alt={item.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Overlay Gradiente */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              {/* Tag Superior (Reel ou Post) */}
              <div className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-bold text-white backdrop-blur-md">
                {item.type === 'reel' ? (
                  <>
                    <Film className="h-2.5 w-2.5 text-emerald-400" />
                    <span>Reel</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="h-2.5 w-2.5 text-blue-400" />
                    <span>Post</span>
                  </>
                )}
              </div>

              {/* Botão de Play para Vídeos/Reels */}
              {item.type === 'reel' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/90 text-black shadow-xl backdrop-blur-sm transition-transform group-hover:scale-110">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </div>
              )}

              {/* Rodapé do Card */}
              <div className="absolute bottom-2 left-2 right-2 flex items-end justify-between">
                <div className="pr-1">
                  <p className="line-clamp-2 text-[11px] font-bold leading-tight text-white drop-shadow-md">
                    {item.title}
                  </p>
                  {item.category && (
                    <span className="text-[9px] font-medium text-emerald-400 drop-shadow">
                      #{item.category}
                    </span>
                  )}
                </div>

                {/* Curtida rápida */}
                <button
                  onClick={(e) => toggleLike(item.id, e)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-md transition-all active:scale-75"
                >
                  <Heart
                    className={`h-3.5 w-3.5 transition-colors ${
                      isLiked ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal para Visualização do Post ou Reel */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl bg-card border border-border/80 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Botão Fechar */}
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white backdrop-blur-md"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Mídia Expandida */}
            <div className="relative h-96 w-full bg-black">
              <img
                src={selectedItem.mediaUrl}
                alt={selectedItem.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            </div>

            {/* Detalhes da Postagem */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                  {selectedItem.category || selectedItem.type.toUpperCase()}
                </span>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                  <span>
                    {(selectedItem.likes || 50) + (likedItems[selectedItem.id] ? 1 : 0)} curtidas
                  </span>
                </div>
              </div>

              <h4 className="text-sm font-bold text-foreground leading-snug">
                {selectedItem.title}
              </h4>

              <div className="pt-2 border-t border-border/50 flex justify-between items-center text-xs">
                <span className="text-muted-foreground text-[10px]">
                  Sincronizado via Painel do CHEFE
                </span>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500 text-black font-bold text-xs shadow-md active:scale-95 transition-all"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
