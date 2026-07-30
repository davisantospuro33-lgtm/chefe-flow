import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      setIsDark(!document.documentElement.classList.contains('light'));
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.classList.toggle('light', !isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-2 rounded-full border border-border bg-card hover:scale-105 active:scale-95 transition-all shadow-sm"
      title={isDark ? 'Mudar para Tema Dia' : 'Mudar para Tema Noite'}
      aria-label={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-200 drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]" />
      ) : (
        <Moon className="w-4 h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.8)]" />
      )}
    </button>
  );
};
