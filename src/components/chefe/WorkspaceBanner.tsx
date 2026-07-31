import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";
import { useChefeStore } from "@/lib/chefe-store";

export function WorkspaceBanner() {
  const url = useChefeStore((s) => s.profile.workspacePhotoUrl);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="relative h-64 max-h-[320px] w-full overflow-hidden rounded-2xl border border-border bg-muted/20 shadow-sm"
    >
      {url ? (
        <img
          src={url}
          alt="Bancada e ambiente da barbearia CHEFE"
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-center"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Foto da bancada
          </span>
        </div>
      )}
      <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10" />
    </motion.div>
  );
}