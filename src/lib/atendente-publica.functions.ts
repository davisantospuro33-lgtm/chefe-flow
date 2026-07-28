import { createServerFn } from "@tanstack/react-start";
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };
export type AtendenteMessage = ChatMsg;

export const atendentePublicaChat = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      input as {
        messages: ChatMsg[];
        distanceKm?: number | null;
        durationMin?: number | null;
      },
  )
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Busca contexto AO VIVO
    const [{ data: state }, { data: queue }, { data: profile }, { data: agenda }, { data: salao }] = await Promise.all([
      supabaseAdmin.from("chefe_state").select("*").eq("id", 1).maybeSingle(),
      supabaseAdmin.from("chefe_queue").select("id,name,position").order("position"),
      supabaseAdmin.from("chefe_profile").select("*").eq("id", 1).maybeSingle(),
      supabaseAdmin
        .from("chefe_agenda")
        .select("id,name,scheduled_at,status")
        .order("scheduled_at"),
      supabaseAdmin.from("chefe_status_salao").select("pessoas_no_salao").eq("id", 1).maybeSingle(),
    ]);

    const instrucoes =
      ((state as unknown as { instrucoes_do_chefe?: string })?.instrucoes_do_chefe) ??
      "";
    const status = (state?.status as string) ?? "available";
    const presencial = state?.presencial_count ?? 0;
    const filaTotal = (queue?.length ?? 0) + presencial;
    const pessoasNoSalao =
      (salao as { pessoas_no_salao?: number } | null)?.pessoas_no_salao ?? 0;
    const agendaHoje = (agenda ?? [])
      .filter((a) => {
        const t = new Date(a.scheduled_at).getTime();
        return t > Date.now() - 3600_000 && t < Date.now() + 12 * 3600_000;
      })
      .slice(0, 8)
      .map((a) => {
        const h = new Date(a.scheduled_at).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        return `${h} ${a.name} (${a.status})`;
      })
      .join(" | ") || "sem horários marcados nas próximas horas";

    // ── TELA 2: leitura em tempo real ───────────────────────────────
    const extraMinutes = (state as unknown as { extra_minutes?: number })?.extra_minutes ?? 0;
    const duracao = profile?.service_duration_min ?? 30;
    const aguardando = (queue?.length ?? 0) + pessoasNoSalao;
    const esperaMin = aguardando * duracao + extraMinutes;
    const salaoLabel =
      pessoasNoSalao === 0 ? "TRANQUILO" : pessoasNoSalao <= 2 ? "MOVIMENTADO" : "CHEIO";
    const proximaPosicao = (queue?.length ?? 0) + 1;
    const filaDetalhe =
      (queue ?? []).map((q, i) => `${i + 1}º ${q.name}`).join(", ") || "fila virtual vazia";

    // Horários livres (hoje e amanhã), grade 09:00–20:00 no passo da duração
    const ocupados = new Set(
      (agenda ?? [])
        .filter((a) => a.status !== "cancelado")
        .map((a) => new Date(a.scheduled_at).getTime()),
    );
    const slotsLivres: string[] = [];
    for (let d = 0; d < 2 && slotsLivres.length < 12; d++) {
      const base = new Date();
      base.setDate(base.getDate() + d);
      for (let min = 9 * 60; min <= 20 * 60; min += duracao) {
        const slot = new Date(base);
        slot.setHours(Math.floor(min / 60), min % 60, 0, 0);
        if (slot.getTime() < Date.now() + 30 * 60_000) continue;
        if (ocupados.has(slot.getTime())) continue;
        slotsLivres.push(
          `${d === 0 ? "hoje" : "amanhã"} ${slot.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
        );
        if (slotsLivres.length >= 12) break;
      }
    }
    const slotsStr = slotsLivres.join(" | ") || "sem vagas livres na grade das próximas 48h";
    const distStr =
      typeof data.distanceKm === "number" && Number.isFinite(data.distanceKm)
        ? data.distanceKm.toFixed(1)
        : "desconhecida";
    const travelMin =
      typeof data.durationMin === "number" && Number.isFinite(data.durationMin)
        ? Math.round(data.durationMin)
        : null;
    const durStr = travelMin !== null ? travelMin.toString() : "desconhecido";
    // Regra fixa: cliente precisa chegar 10 min ANTES da vez.
    const BUFFER_MIN = 10;
    const leaveInStr = travelMin !== null ? (travelMin + BUFFER_MIN).toString() : "desconhecido";

    const changes: string[] = [];
    const tools = {
      realizarCheckin: tool({
        description:
          "Registra a solicitação do cliente na fila pendente do CHEFE (tabela chefe_pendentes). Use APENAS quando tiver coletado nome, telefone (ou 'sem telefone'), referência de quem indicou/como conhece, perfil (cliente novo, já cliente, indicação) e quantidade de cortes. Depois de chamar esta tool, avise o cliente que a solicitação chegou no painel do CHEFE.",
        inputSchema: z.object({
          name: z.string(),
          phone: z.string(),
          referencia: z.string(),
          perfil: z.string(),
          qtd: z.number(),
        }),
        execute: async (input) => {
          const { error } = await supabaseAdmin.from("chefe_pendentes").insert({
            name: input.name,
            phone: input.phone || "",
            referencia: input.referencia,
            perfil: input.perfil,
            qtd: input.qtd,
          });
          if (error) return { ok: false, error: error.message };
          // Broadcast Realtime no canal painel_operacao
          try {
            const ch = supabaseAdmin.channel("painel_operacao");
            await ch.send({
              type: "broadcast",
              event: "nova-solicitacao",
              payload: { name: input.name, qtd: input.qtd },
            });
            await supabaseAdmin.removeChannel(ch);
          } catch (e) {
            console.warn("broadcast falhou", e);
          }
          changes.push(`Check-in: ${input.name}`);
          return { ok: true };
        },
      }),
      alertarChefeEmergencia: tool({
        description:
          "PONTE DE EMERGÊNCIA: chame esta tool SEMPRE que ocorrer imprevisto, dúvida atípica, cliente fora da regra, reclamação, cancelamento inesperado, ou qualquer situação que exija decisão do CHEFE em pessoa. Isso dispara um alerta em tempo real no Chat Privado de Comando do CHEFE com o resumo do problema para tomada de decisão conjunta.",
        inputSchema: z.object({
          resumo: z.string(),
          cliente_nome: z.string().optional(),
          urgencia: z.enum(["baixa", "media", "alta"]),
        }),
        execute: async (input) => {
          try {
            const ch = supabaseAdmin.channel("painel_operacao");
            await ch.send({
              type: "broadcast",
              event: "alerta-emergencia",
              payload: {
                resumo: input.resumo,
                cliente_nome: input.cliente_nome ?? null,
                urgencia: input.urgencia,
                ts: Date.now(),
              },
            });
            await supabaseAdmin.removeChannel(ch);
          } catch (e) {
            console.warn("alertarChefeEmergencia broadcast falhou", e);
          }
          changes.push(`🚨 Alerta enviado ao CHEFE: ${input.resumo}`);
          return { ok: true };
        },
      }),
    };

    const system = `Você é o CEOCHEFE — RECEPCIONISTA DE ELITE da barbearia CHEFE. Direto, objetivo, prestativo e cirúrgico. Fale sempre em português brasileiro, 2-4 frases por resposta, emojis com moderação. Você NÃO envia avisos por conta própria: só responde com precisão quando consultado.

━━━ DIRETRIZES DA OPERAÇÃO ENVIADAS PELO CHEFE AO VIVO ━━━
Instrução atual do CHEFE: ${instrucoes || "(nenhuma ordem específica no momento — atenda com o padrão de excelência)"}

━━━ ESTADO ATUAL DA CASA (3 FRENTES CONSULTADAS AGORA) ━━━
Status do CHEFE: ${status}
FRENTE 1 (Sequência Virtual do Dia — chefe_queue): ${queue?.length ?? 0} cliente(s) na ordem virtual.
FRENTE 2 (Agenda Fixa — chefe_agenda): ${agendaHoje}.
FRENTE 3 (Fila Presencial no Salão — chefe_status_salao): ${pessoasNoSalao} pessoa(s) aguardando fisicamente no sofá do salão agora.
Total geral aguardando (virtual + presencial + no salão): ${filaTotal + pessoasNoSalao}.
Preço do corte: ${profile?.service_price ?? "R$ 25,00"}
Duração média: ${profile?.service_duration_min ?? 30} min

━━━ TELA 2 AO VIVO (use estes números, nunca invente) ━━━
NO SALÃO AGORA: ${salaoLabel} — ${pessoasNoSalao} cliente(s) na fila presencial.
ENCAIXE VIRTUAL: ${filaDetalhe}. Quem entrar agora fica na posição ${proximaPosicao}º.
TEMPO ESTIMADO DE ESPERA: ~${esperaMin} min (${aguardando} aguardando × ${duracao} min + ${extraMinutes} min de ajuste lançado pelo CHEFE no painel).
AGENDA — HORÁRIOS DISPONÍVEIS: ${slotsStr}.

REGRAS DE ATENDIMENTO:
• "Como está o salão?" → responda o status (${salaoLabel}), quantas pessoas e o tempo estimado.
• "Quero entrar na fila / encaixe" → faça a triagem e, ao completar os dados, chame realizarCheckin e confirme a posição ${proximaPosicao}º e o tempo estimado.
• "Garantir vaga / horários" → liste no máximo 4 opções da AGENDA acima e peça a escolha antes de seguir com a triagem.
• O tempo estimado sempre deriva dos comandos do CHEFE no painel (corte iniciado/finalizado e ajuste de +10 min). Nunca chute outro número.
• Se o cliente quiser papo/resenha direta com o profissional, ofereça claramente falar direto com o CHEFE e chame alertarChefeEmergencia com o resumo.

━━━ SENSORES DE LOCALIZAÇÃO DO CLIENTE ━━━
Distância do cliente até o salão: ${distStr} km.
Tempo puro de trajeto via GPS: ${durStr} min.
REGRA DE ANTECEDÊNCIA (FIXA E OBRIGATÓRIA): o cliente DEVE chegar 10 min ANTES da vez dele. Portanto o tempo total de aviso pra sair de casa é sempre TRAJETO_GPS + 10 min. Neste caso: SAIA EM ${leaveInStr} MIN.
Sempre que falar de "hora de sair" ou urgência, use exatamente esse número (${leaveInStr} min) e mencione os 10 min de antecedência. Nunca sugira sair só com o tempo puro do GPS.

LÁBIA E PERSUASÃO: Adapte seu tom de voz imediatamente. Se o cliente estiver PERTO (< 3km ou < 10 min), use o gatilho de urgência para fechar a vaga na cadeira ("você está pertinho, dá pra chegar rapidinho, quer que eu já reserve?"). Se estiver LONGE, valorize a organização ("me manda seus dados que eu já garanto sua posição na fila e te aviso a hora exata de sair"). Se o CHEFE estiver em pausa/fechado, seja transparente e ofereça agendar pra depois.

PONTE DE EMERGÊNCIA (uso obrigatório): sempre que o cliente reclamar, cancelar em cima da hora, fizer pedido fora do padrão (ex: fora de horário, serviço não listado, dúvida que você não consegue responder), ou você sentir qualquer imprevisto — chame IMEDIATAMENTE a tool alertarChefeEmergencia com um resumo claro. O CHEFE recebe isso ao vivo no Chat Privado de Comando e decide contigo.

FLUXO DE TRIAGEM (colete um por vez, natural, sem parecer formulário):
1. Nome completo
2. Telefone/WhatsApp (aceite "não tenho" ou "pular")
3. Referência (quem indicou, ou como conhece o CHEFE)
4. Perfil (já sou cliente / cliente novo / fui indicado)
5. Quantidade de cortes (só ele ou traz mais alguém?)

Quando tiver TODOS os 5 dados, chame a tool realizarCheckin AUTOMATICAMENTE e depois confirme ao cliente que a solicitação foi enviada ao painel do CHEFE.`;

    const gw = createLovableAiGatewayProvider(key);
    const model = gw("google/gemini-3-flash-preview");

    const result = await generateText({
      model,
      messages: [{ role: "system" as const, content: system }, ...data.messages],
      tools,
      stopWhen: stepCountIs(4),
    });

    return { text: result.text, changes };
  });
