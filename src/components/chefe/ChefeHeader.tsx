import React from 'react';
import { Send } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { ShareButton } from './ShareButton';

interface ChefeHeaderProps {
  onOpenChat: () => void;
}

export const ChefeHeader: React.FC<ChefeHeaderProps> = ({ onOpenChat }) => (
  <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/90 px-4 py-3 backdrop-blur-md">
    <h1 className="logo-chefe text-xl font-black tracking-wider">CHEFE</h1>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <ShareButton />
      <button
        onClick={onOpenChat}
        className="relative rounded-full bg-muted p-2 text-foreground transition-all hover:opacity-80"
        title="Abrir Chat com CEOCHEFE"
        aria-label="Abrir chat com o CEOCHEFE"
      >
        <Send size={20} />
        <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-foreground ring-2 ring-background" />
      </button>
    </div>
  </header>
);