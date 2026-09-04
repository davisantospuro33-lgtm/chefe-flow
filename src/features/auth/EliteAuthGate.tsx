import { useState } from "react";
import { ArrowRight, BriefcaseBusiness, ChevronLeft, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { EliteClientApp } from "@/features/discover/EliteClientApp";
import { EliteProfessionalApp } from "@/features/cockpit/EliteProfessionalApp";

export function EliteAuthGate() {
  const [role, setRole] = useState<"client" | "professional" | null>(null);
  if (role === "client") return <EliteClientApp />;
  if (role === "professional") return <EliteProfessionalApp />;
  return <main className="elite-shell flex min-h-screen flex-col justify-between px-5 py-10 text-white"><div><div className="flex items-center justify-between"><div className="elite-logo">CHEFE<span>.</span></div><span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/45">Elite access</span></div><div className="mt-24 max-w-sm"><p className="elite-kicker text-[#c6ff4a]">Atendimento, no seu ritmo</p><h1 className="mt-4 text-5xl font-black leading-[0.95] tracking-[-0.08em]">A cidade inteira<br/><span className="text-white/35">na sua mão.</span></h1><p className="mt-6 max-w-xs text-sm leading-6 text-white/50">Encontre profissionais excepcionais ou assuma o comando da sua operação.</p></div><div className="mt-12 space-y-3"><button onClick={() => setRole("client")} className="role-card"><span className="role-icon bg-[#c6ff4a] text-black"><UserRound size={22}/></span><span className="flex-1 text-left"><b>Sou Cliente</b><small>Descobrir, agendar e acompanhar</small></span><ArrowRight size={18}/></button><button onClick={() => setRole("professional")} className="role-card"><span className="role-icon bg-white/10 text-[#c6ff4a]"><BriefcaseBusiness size={22}/></span><span className="flex-1 text-left"><b>Sou Profissional</b><small>Gerenciar meu atendimento</small></span><ArrowRight size={18}/></button></div></div><div className="flex items-center justify-center gap-2 text-[11px] text-white/35"><ShieldCheck size={14} className="text-[#c6ff4a]"/> Ambiente seguro e privado <Sparkles size={13}/></div></main>;
}
