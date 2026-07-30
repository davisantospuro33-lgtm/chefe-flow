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
      <h1 className="text-xl font-black tracking-wider uppercase bg-gradient-to-r from-zinc-900 via-zinc-500 to-black dark:from-white dark:via-zinc-400 dark:to-zinc-100 bg-clip-text text-transparent drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)] dark:drop-shadow-[0_1px_2px_rgba(255,255,255,0.2)]">
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
