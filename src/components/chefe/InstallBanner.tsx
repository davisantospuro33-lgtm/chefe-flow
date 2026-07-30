import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Smartphone, X } from "lucide-react";

const DISMISS_KEY = "chefe-install-banner-dismissed";

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia?.("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS Safari
      window.navigator.standalone === true;
    if (standalone) return;
    if (localStorage.getItem(DISMISS_KEY) === "1") return;
    const ua = window.navigator.userAgent;
    setIsIOS(/iPhone|iPad|iPod/i.test(ua));
    setVisible(true);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          className="mb-4 flex items-center gap-3 rounded-xl p-3 shadow-sm border border-border bg-card text-card-foreground transition-colors duration-200"
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground">
            <Smartphone className="h-4 w-4 text-black dark:text-white" />
          </div>
          <p className="flex-1 text-[12px] leading-snug text-muted-foreground">
            {isIOS ? (
              <>
                Toque em <strong>Compartilhar</strong> e depois em{" "}
                <strong className="text-black dark:text-white font-bold">
                  "Adicionar à Tela de Início"
                </strong>
                .
              </>
            ) : (
              <>
                Toque no menu do navegador e escolha{" "}
                <strong className="text-black dark:text-white font-bold">
                  "Adicionar à Tela de Início"
                </strong>
                .
              </>
            )}
          </p>
          <button
            onClick={dismiss}
            aria-label="Fechar aviso"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
