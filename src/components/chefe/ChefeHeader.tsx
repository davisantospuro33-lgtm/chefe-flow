import React, { useState } from 'react';
import { Send, List, Scissors, Clock, DollarSign, X } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ShareButton } from './ShareButton';
import { useChefeStore } from '@/lib/chefe-store';

interface ChefeHeaderProps {
  onOpenChat: () => void;
}

export const ChefeHeader: React.FC<ChefeHeaderProps> = ({ onOpenChat }) => {
  const [showServiceModal, setShowServiceModal] = useState(false);
  const service = useChefeStore((s) => s.mainService) ?? {
    name: 'Corte CHEFE',
    price: '25,00',
    duration: '40 min',
    hours: '9h-20h',
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur border-b border-border transition-colors duration-200">
        <div className="flex items-center gap-3">
          {/* Botão Ícone de Lista de Serviços (Canto Superior Esquerdo) */}
          <button
            onClick={() => setShowServiceModal(true)}
            className="p-1.5 rounded-lg hover:bg-muted text-foreground transition-colors"
            title="Ver Serviço Principal"
            aria-label="Abrir menu de serviço principal"
          >
            <List size={22} />
          </button>

          <h1 className="text-xl font-black tracking-wider uppercase text-foreground">
            CHEFE
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <ShareButton />
          <button
            onClick={onOpenChat}
            className="relative rounded-full bg-muted p-2 hover:bg-accent text-foreground transition-colors"
            title="Abrir Chat com CEOCHEFE"
            aria-label="Abrir chat com o CEOCHEFE"
          >
            <Send size={20} />
            <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
          </button>
        </div>
      </header>

      {/* Modal / Aba do Serviço Principal (Compatível com Tema Light e Dark) */}
      {showServiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-2xl bg-card border border-border p-5 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 text-card-foreground">
            <button
              onClick={() => setShowServiceModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
              <Scissors size={14} className="text-primary" />
              <span>Serviço Principal</span>
            </div>

            <h3 className="text-xl font-extrabold text-foreground mb-4">
              {service.name}
            </h3>

            <div className="space-y-3 border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <DollarSign size={16} className="text-emerald-500" />
                  Preço:
                </span>
                <strong className="text-base font-bold text-foreground">
                  R$ {service.price}
                </strong>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} className="text-sky-500" />
                  Tempo Estimado:
                </span>
                <strong className="font-semibold text-foreground">
                  {service.duration}
                </strong>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Clock size={16} className="text-amber-500" />
                  Horário:
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500">
                  {service.hours}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowServiceModal(false)}
              className="w-full mt-6 py-2.5 rounded-xl bg-foreground text-background font-bold hover:opacity-90 transition-opacity"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </>
  );
};
