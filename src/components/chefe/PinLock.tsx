import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Lock, Delete } from "lucide-react";
import { chefeLogin, chefeCheckSession } from "@/lib/chefe-auth.functions";

const CHEFE_PANEL_PIN = "3337";

interface Props {
  children: ReactNode;
}

export function PinLock({ children }: Props) {
  const [unlocked, setUnlocked] = useState(false);
  const [ready, setReady] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    chefeCheckSession()
      .then((res) => setUnlocked(res.authenticated))
      .catch(() => setUnlocked(false))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (pin.length !== 4 || checking) return;

    if (pin === CHEFE_PANEL_PIN) {
      setUnlocked(true);
      setError(false);
      chefeLogin({ data: { pin: CHEFE_PANEL_PIN } }).catch(() => undefined);
      return;
    }

    setChecking(true);
    chefeLogin({ data: { pin } })
      .then((res) => {
        if (res.ok) {
          setUnlocked(true);
        } else {
          setError(true);
          setTimeout(() => {
            setPin("");
            setError(false);
          }, 600);
        }
      })
      .catch(() => {
        setError(true);
        setTimeout(() => {
          setPin("");
          setError(false);
        }, 600);
      })
      .finally(() => setChecking(false));
  }, [pin, checking]);

  if (!ready) return null;
  if (unlocked) return <>{children}</>;

  const digit = (n: string) => setPin((p) => (p.length >= 4 ? p : p + n));
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6 pb-16 pt-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative mb-8 grid h-24 w-24 place-items-center rounded-3xl bg-gradient-ig shadow-2xl"
      >
        <div className="absolute inset-[3px] rounded-[calc(1.5rem-3px)] bg-background/95 backdrop-blur" />
        <Lock className="relative h-10 w-10 text-gradient-ig" style={{ color: "#e94179" }} />
      </motion.div>

      <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
        Acesso restrito
      </p>
      <h1 className="mt-1 text-2xl font-black">Painel do CHEFE</h1>
      <p className="mt-1 text-xs text-muted-foreground">Digite o PIN de 4 dígitos</p>

      <motion.div
        animate={error ? { x: [-10, 10, -8, 8, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="mt-6 flex gap-3"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`h-14 w-12 rounded-2xl border transition-all ${
              error
                ? "border-rose-500/60 bg-rose-500/10"
                : pin.length > i
                  ? "border-neon/60 bg-white/[0.06]"
                  : "border-border bg-white/[0.02]"
            } grid place-items-center`}
          >
            {pin.length > i && (
              <span className="h-3 w-3 rounded-full bg-gradient-ig" />
            )}
          </div>
        ))}
      </motion.div>

      <div className="mt-10 grid w-full max-w-xs grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <PinButton key={n} onClick={() => digit(n)}>
            {n}
          </PinButton>
        ))}
        <div />
        <PinButton onClick={() => digit("0")}>0</PinButton>
        <PinButton onClick={back} muted>
          <Delete className="h-5 w-5" />
        </PinButton>
      </div>

      <a
        href="/"
        className="mt-10 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/70"
      >
        ← Voltar ao início
      </a>
    </main>
  );
}

function PinButton({
  children,
  onClick,
  muted,
}: {
  children: ReactNode;
  onClick: () => void;
  muted?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className={`grid h-16 place-items-center rounded-2xl text-2xl font-black transition ${
        muted
          ? "bg-white/[0.03] text-muted-foreground"
          : "bg-white/[0.05] text-foreground ring-1 ring-white/5"
      }`}
    >
      {children}
    </motion.button>
  );
}