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
          className="mb-4 flex items-center gap-3 rounded-2xl px-4 py-3"
          style={{
            background: "linear-gradient(90deg, rgba(30,27,75,0.9), rgba(49,16,66,0.9))",
            border: "1px solid rgba(217,70,239,0.3)",
          }}
        >
          <div
            className="grid h-9 w-9 shrink-0 place-items-center rounded-xl"
            style={{ background: "var(--gradient-ig)" }}
          >
            <Smartphone className="h-4 w-4 text-white" />
          </div>
          <p className="flex-1 text-[12px] leading-snug text-white/90">
            {isIOS ? (
              <>
                Toque em <strong>Compartilhar</strong> e escolha{" "}
                <strong>"Adicionar à Tela de Início"</strong> para usar como App.
              </>
            ) : (
              <>
                Toque no menu do navegador e escolha{" "}
                <strong>"Adicionar à Tela de Início"</strong> para usar como App.
              </>
            )}
          </p>
          <button
            onClick={dismiss}
            aria-label="Fechar aviso"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-white/5"
          >
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}