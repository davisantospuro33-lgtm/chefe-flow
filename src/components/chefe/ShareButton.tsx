import { Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface ShareButtonProps {
  label?: string;
  variant?: "chip" | "block";
}

export function ShareButton({ label = "Convidar Cliente", variant = "chip" }: ShareButtonProps) {
  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.origin + "/" : "";
    const shareData = {
      title: "CHEFE — Fila Inteligente",
      text: "Acompanhe minha fila de cortes em tempo real e garanta sua vaga!",
      url,
    };
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("🔗 Link copiado — cole no WhatsApp do cliente.");
    } catch {
      // user cancelled — ignore
    }
  }

  if (variant === "block") {
    return (
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={handleShare}
        className="flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left"
        style={{
          background: "rgba(59,130,246,0.08)",
          border: "1px solid rgba(59,130,246,0.3)",
        }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#60a5fa" }}>
            Link do App
          </p>
          <p className="text-sm font-semibold text-foreground/90">Enviar para clientes</p>
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold"
          style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}
        >
          <Share2 className="h-3.5 w-3.5" /> Compartilhar
        </span>
      </motion.button>
    );
  }

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={handleShare}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
      style={{
        background: "rgba(59,130,246,0.1)",
        border: "1px solid rgba(59,130,246,0.3)",
        color: "#60a5fa",
      }}
    >
      <Share2 className="h-3 w-3" /> {label}
    </motion.button>
  );
}