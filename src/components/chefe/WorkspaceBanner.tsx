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
      className="w-full overflow-hidden rounded-2xl border border-border bg-muted/20 p-1 shadow-sm"
    >
      {url ? (
        <img
          src={url}
          alt="Bancada e ambiente da barbearia CHEFE"
          loading="lazy"
          decoding="async"
          className="w-full h-auto max-h-[500px] object-contain rounded-xl"
        />
      ) : (
        <div className="flex h-48 w-full flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground">
          <ImageIcon className="h-6 w-6" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Foto da bancada
          </span>
        </div>
      )}
    </motion.div>
  );
}