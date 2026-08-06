import { useEffect, useState, type ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2, Lock, Mail, User } from "lucide-react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * Gate de acesso do cliente. Envolve a experiência pública sem alterar
 * nenhuma lógica existente: sem sessão -> tela de login/cadastro.
 */
export function ClientAuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  return <>{children}</>;
}

function AuthScreen() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        // Mesmo com confirmação automática, forçamos o fluxo explícito de login.
        if (data.session) {
          await supabase.auth.signOut();
        }
        setMode("login");
        setName("");
        setPassword("");
        setInfo("Cadastro realizado com sucesso. Agora faça login.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      const raw = err instanceof Error ? err.message : "";
      const msg = /already registered|User already/i.test(raw)
        ? "Este e-mail já tem conta. Faça login."
        : /Invalid login credentials/i.test(raw)
          ? "E-mail ou senha incorretos."
          : raw || "Não foi possível continuar.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center bg-background px-6 py-12 text-foreground">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-4xl font-black uppercase tracking-[0.3em] text-foreground">CHEFE</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "login"
            ? "Entre para acompanhar sua vez em tempo real."
            : "Crie seu acesso e acompanhe tudo pelo celular."}
        </p>

        <form onSubmit={submit} className="mt-8 space-y-3">
          {mode === "signup" && (
            <Field icon={<User size={16} />}>
              <input
                required
                maxLength={80}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </Field>
          )}

          <Field icon={<Mail size={16} />}>
            <input
              required
              type="email"
              autoComplete="email"
              maxLength={255}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-mail"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </Field>

          <Field icon={<Lock size={16} />}>
            <input
              required
              type="password"
              minLength={6}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Senha"
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
            />
          </Field>

          {error && <p className="text-xs font-semibold text-rose-500">{error}</p>}
          {info && <p className="text-xs font-semibold text-emerald-500">{info}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-foreground py-3.5 text-sm font-black uppercase tracking-widest text-background transition hover:opacity-90 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "login" ? "Entrar" : "Criar conta"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
            setInfo(null);
          }}
          className="mt-6 w-full text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground transition hover:text-foreground"
        >
          {mode === "login" ? "Não tem conta? Cadastre-se" : "Já tem conta? Entrar"}
        </button>
      </motion.div>
    </main>
  );
}

function Field({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-border bg-card/60 px-4 py-3.5 backdrop-blur transition focus-within:border-foreground/40">
      <span className="text-muted-foreground">{icon}</span>
      {children}
    </label>
  );
}