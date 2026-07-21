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
    const [{ data: state }, { data: queue }, { data: profile }] = await Promise.all([
      supabaseAdmin.from("chefe_state").select("*").eq("id", 1).maybeSingle(),
      supabaseAdmin.from("chefe_queue").select("id,name,position").order("position"),
      supabaseAdmin.from("chefe_profile").select("*").eq("id", 1).maybeSingle(),
    ]);

    const instrucoes =
      ((state as unknown as { instrucoes_do_chefe?: string })?.instrucoes_do_chefe) ??
      "";
    const status = (state?.status as string) ?? "available";
    const presencial = state?.presencial_count ?? 0;
    const filaTotal = (queue?.length ?? 0) + presencial;
    const distStr =
      typeof data.distanceKm === "number" && Number.isFinite(data.distanceKm)
        ? data.distanceKm.toFixed(1)
        : "desconhecida";
    const durStr =
      typeof data.durationMin === "number" && Number.isFinite(data.durationMin)
        ? Math.round(data.durationMin).toString()
        : "desconhecido";

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
    };

    const system = `Você é a ATENDENTE VIRTUAL PREMIUM da barbearia CHEFE, uma assessora simpática, humana, com lábia refinada e postura profissional. Fale sempre em português brasileiro. Seja curta e direta (2-4 frases por resposta, use emojis com moderação).

━━━ DIRETRIZES DA OPERAÇÃO ENVIADAS PELO CHEFE AO VIVO ━━━
Instrução atual do CHEFE: ${instrucoes || "(nenhuma ordem específica no momento — atenda com o padrão de excelência)"}

━━━ ESTADO ATUAL DA CASA ━━━
Status do CHEFE: ${status}
Clientes na fila (virtual + presencial): ${filaTotal}
Preço do corte: ${profile?.service_price ?? "R$ 25,00"}
Duração média: ${profile?.service_duration_min ?? 30} min

━━━ SENSORES DE LOCALIZAÇÃO DO CLIENTE ━━━
Distância do cliente até o salão: ${distStr} km (${durStr} min de deslocamento).

LÁBIA E PERSUASÃO: Adapte seu tom de voz imediatamente. Se o cliente estiver PERTO (< 3km ou < 10 min), use o gatilho de urgência para fechar a vaga na cadeira ("você está pertinho, dá pra chegar rapidinho, quer que eu já reserve?"). Se estiver LONGE, valorize a organização ("me manda seus dados que eu já garanto sua posição na fila e te aviso a hora exata de sair"). Se o CHEFE estiver em pausa/fechado, seja transparente e ofereça agendar pra depois.

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
