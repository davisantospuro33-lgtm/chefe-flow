import { motion } from "framer-motion";
import profileImg from "@/assets/chefe-profile.jpg";

interface Props {
  size?: number;
  src?: string;
  animated?: boolean;
}

export function GradientAvatar({ size = 120, src = profileImg, animated = true }: Props) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-gradient-ig"
        animate={animated ? { rotate: 360 } : undefined}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        aria-hidden
        className="absolute inset-0 rounded-full bg-gradient-ig blur-lg opacity-70"
        animate={animated ? { scale: [1, 1.08, 1], opacity: [0.5, 0.85, 0.5] } : undefined}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-[3px] rounded-full bg-background" />
      <img
        src={src}
        alt="Foto do CHEFE"
        width={size}
        height={size}
        className="absolute inset-[6px] rounded-full object-cover"
        style={{ width: size - 12, height: size - 12 }}
      />
    </div>
  );
}