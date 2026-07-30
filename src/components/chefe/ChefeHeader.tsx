import React from 'react';
import { Send } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ShareButton } from './ShareButton';

interface ChefeHeaderProps {
  onOpenChat: () => void;
}

export const ChefeHeader: React.FC<ChefeHeaderProps> = ({ onOpenChat }) => {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur border-b border-border transition-colors duration-200">
      <h1 className="text-xl font-black tracking-wider uppercase text-black dark:text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)] dark:drop-shadow-[0_1px_3px_rgba(255,255,255,0.3)]">
        CHEFE
      </h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ShareButton />
        <button
          onClick={onOpenChat}
          className="relative rounded-full bg-muted p-2 hover:bg-accent transition-colors"
          title="Abrir Chat com CEOCHEFE"
          aria-label="Abrir chat com o CEOCHEFE"
        >
          <Send size={20} />
          <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
        </button>
      </div>
    </header>
  );
};
