import { motion } from "framer-motion";

export function Manifesto() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      className="relative overflow-hidden rounded-3xl p-[1px]"
    >
      <div className="absolute inset-0 bg-gradient-ig opacity-40" />
      <div className="relative rounded-[calc(1.5rem-1px)] glass-strong p-6">
        <p className="mb-4 text-2xl">👋</p>
        <p className="mb-4 text-lg leading-snug font-semibold">
          Bem-vindo ao <span className="text-gradient-ig font-black">CHEFE</span>.
        </p>
        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
          Criamos este espaço para deixar nosso atendimento mais{" "}
          <span className="font-semibold text-foreground">organizado, transparente e inteligente</span>. Aqui você
          acompanha tudo em tempo real, sem precisar perguntar nada pelo WhatsApp.
        </p>

        <div className="my-5 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <p className="mb-3 text-[11px] font-bold uppercase tracking-widest text-gradient-ig">Nosso objetivo</p>
        <p className="text-2xl font-black leading-tight text-foreground">
          Valorizar o tempo <br /> de todos.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">Menos espera. Mais organização.</p>

        <div className="mt-6 rounded-2xl bg-black/30 p-4">
          <p className="text-xs leading-relaxed text-foreground/90">
            <span className="text-gradient-ig font-bold">O CHEFE pensa por você:</span> o sistema avisa a hora de sair,
            mostra a fila e atualiza o seu celular.
          </p>
        </div>
      </div>
    </motion.section>
  );
}