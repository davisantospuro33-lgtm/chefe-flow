import { motion } from "framer-motion";
import { DollarSign, MapPin, Clock } from "lucide-react";

const items = [
  { icon: DollarSign, label: "Preços", detail: "R$ 25" },
  { icon: MapPin, label: "Localização", detail: "2,4 km" },
  { icon: Clock, label: "Horários", detail: "9h–20h" },
];

export function Highlights() {
  return (
    <div className="flex justify-center gap-6 py-2">
      {items.map((it, i) => (
        <motion.button
          key={it.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * i }}
          whileTap={{ scale: 0.95 }}
          className="flex flex-col items-center gap-2"
        >
          <span className="relative grid h-[72px] w-[72px] place-items-center">
            <span className="absolute inset-0 rounded-full bg-gradient-ig" />
            <span className="absolute inset-[2px] rounded-full bg-background" />
            <span className="relative grid h-[60px] w-[60px] place-items-center rounded-full glass">
              <it.icon className="h-6 w-6 text-foreground" strokeWidth={1.75} />
            </span>
          </span>
          <span className="text-xs font-medium text-muted-foreground">{it.label}</span>
          <span className="-mt-1 text-[11px] font-semibold text-foreground/90">{it.detail}</span>
        </motion.button>
      ))}
    </div>
  );
}