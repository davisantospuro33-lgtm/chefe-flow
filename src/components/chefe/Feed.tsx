import cut1 from "@/assets/cut-1.jpg";
import cut2 from "@/assets/cut-2.jpg";
import cut3 from "@/assets/cut-3.jpg";
import cut4 from "@/assets/cut-4.jpg";
import cut5 from "@/assets/cut-5.jpg";
import cut6 from "@/assets/cut-6.jpg";
import { motion } from "framer-motion";
import { Grid3x3, Heart } from "lucide-react";

const shots = [cut1, cut2, cut3, cut4, cut5, cut6];

export function Feed() {
  return (
    <div>
      <div className="mb-2 flex items-center justify-center gap-2 border-t border-border pt-3 text-muted-foreground">
        <Grid3x3 className="h-4 w-4" />
        <span className="text-[11px] font-bold uppercase tracking-widest">Portfólio</span>
      </div>
      <div className="grid grid-cols-3 gap-[2px]">
        {shots.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.04 * i }}
            className="group relative aspect-square overflow-hidden"
          >
            <img
              src={src}
              alt={`Corte ${i + 1}`}
              loading="lazy"
              width={640}
              height={640}
              className="h-full w-full object-cover transition-transform duration-500 group-active:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-active:opacity-100">
              <Heart className="h-5 w-5 fill-white text-white" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}