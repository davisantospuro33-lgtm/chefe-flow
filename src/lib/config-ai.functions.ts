import { createServerFn } from "@tanstack/react-start";
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

export const configAssistantChat = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input as { messages: ChatMsg[] })
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const gw = createLovableAiGatewayProvider(key);
    const model = gw("google/gemini-3-flash-preview");

    const changes: string[] = [];

    const tools = {
      updateProfile: tool({
        description:
          "Atualiza campos do perfil público da barbearia CHEFE. Todos os campos são opcionais; envie apenas os que devem mudar.",
        inputSchema: z.object({
          username: z.string().nullable(),
          bio: z.string().nullable(),
          cuts_count: z.string().nullable(),
          rating: z.string().nullable(),
          service_price: z.string().nullable(),
          service_duration_min: z.number().nullable(),
          phone_official: z.string().nullable(),
          latitude: z.number().nullable(),
          longitude: z.number().nullable(),
          ai_greeting: z.string().nullable(),
        }),
        execute: async (input) => {
          const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
          for (const [k, v] of Object.entries(input)) {
            if (v !== null && v !== undefined) patch[k] = v;
          }
          if (Object.keys(patch).length === 1) return { ok: true, msg: "nenhum campo alterado" };
          const { error } = await supabaseAdmin.from("chefe_profile").update(patch).eq("id", 1);
          if (error) return { ok: false, error: error.message };
          changes.push(`Perfil atualizado: ${Object.keys(patch).filter((k) => k !== "updated_at").join(", ")}`);
          return { ok: true };
        },
      }),
      addReview: tool({
        description: "Adiciona um novo depoimento no perfil público.",
        inputSchema: z.object({
          name: z.string(),
          rating: z.number(),
          comment: z.string(),
        }),
        execute: async (input) => {
          const { error } = await supabaseAdmin.from("chefe_reviews").insert({
            name: input.name,
            rating: input.rating,
            comment: input.comment,
          });
          if (error) return { ok: false, error: error.message };
          changes.push(`Depoimento de ${input.name} adicionado`);
          return { ok: true };
        },
      }),
      readProfile: tool({
        description: "Lê os valores atuais do perfil público.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data } = await supabaseAdmin.from("chefe_profile").select("*").eq("id", 1).maybeSingle();
          return data ?? {};
        },
      }),
    };

    const system = `Você é a Central de Engenharia da IA do app CHEFE — uma barbearia digital.
Fale sempre em português brasileiro, tom direto, curto e prático.
Você é um ASSISTENTE DE CONFIGURAÇÃO: quando o dono (CHEFE) pedir para mudar textos, preços, foto, telefone, coordenadas, saudação da IA de triagem, nota, número de cortes ou adicionar depoimentos, USE as tools disponíveis para gravar no banco de dados imediatamente.
Regras importantes:
- Você NÃO controla os botões de status (Disponível/Pausa/Fechado). Esses são 100% manuais.
- Se o usuário pedir algo que exige código-fonte novo (novas funcionalidades, novos componentes), explique em uma frase que essa mudança precisa passar pelo editor Lovable, e sugira o texto exato do pedido.
- Sempre confirme o que mudou em uma frase curta.`;

    const modelMessages = [
      { role: "system" as const, content: system },
      ...data.messages,
    ];

    const result = await generateText({
      model,
      messages: modelMessages,
      tools,
      stopWhen: stepCountIs(6),
    });

    return { text: result.text, changes };
  });