import { useEffect, useState } from "react";

/**
 * Observa a classe `dark` no <html> (alternada pelo ThemeToggle) e retorna
 * se o tema escuro está ativo. Usado para adaptar recursos que não são
 * puramente CSS (ex.: tiles do Leaflet) ao tema atual.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document === "undefined") return true;
    return document.documentElement.classList.contains("dark");
  });

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const update = () => setIsDark(root.classList.contains("dark"));
    update();
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
