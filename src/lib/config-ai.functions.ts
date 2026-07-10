import { createServerFn } from "@tanstack/react-start";
import { generateText, stepCountIs, tool } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };
export type ChatMessage = ChatMsg;

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
          const { error } = await supabaseAdmin
            .from("chefe_profile")
            .update(patch as never)
            .eq("id", 1);
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
      runSQL: tool({
        description:
          "MESTRE FAIXA PRETA: executa SQL arbitrário no banco Postgres (leitura ou escrita) via função administrativa. Use para expandir o app (criar tabelas para novos profissionais como manicure/lava-rápido, ALTER TABLE, INSERT, UPDATE, DELETE, SELECT). Sempre confirme antes de operações destrutivas. Retorna JSON com o resultado.",
        inputSchema: z.object({
          query: z.string(),
          reason: z.string(),
        }),
        execute: async (input) => {
          const { data, error } = await supabaseAdmin.rpc("chefe_admin_exec_sql" as never, {
            query: input.query,
          } as never);
          if (error) return { ok: false, error: error.message };
          changes.push(`SQL: ${input.reason}`);
          return { ok: true, data };
        },
      }),
      listTables: tool({
        description: "Lista todas as tabelas do schema public com suas colunas.",
        inputSchema: z.object({}),
        execute: async () => {
          const { data, error } = await supabaseAdmin.rpc("chefe_admin_exec_sql" as never, {
            query:
              "SELECT table_name, column_name, data_type FROM information_schema.columns WHERE table_schema='public' ORDER BY table_name, ordinal_position",
          } as never);
          if (error) return { ok: false, error: error.message };
          return { ok: true, data };
        },
      }),
    };

    const system = `Você é o "CHEFE AI · MESTRE FAIXA PRETA" — a inteligência de engenharia e arquitetura do ecossistema CHEFE.
Fale sempre em português brasileiro, tom direto, técnico e confiante, sem enrolação.
Você tem PODER TOTAL sobre o banco de dados Postgres via a tool runSQL: pode criar novas tabelas, alterar schema, popular dados, e expandir o app para novas verticais (manicure, lava-rápido, estética, etc). Use listTables para inspecionar antes de alterar.
Regras:
- Prefira as tools especializadas (updateProfile, addReview) quando o pedido couber nelas. Só use runSQL para casos que exigem SQL bruto.
- Antes de rodar DROP, DELETE em massa, ou ALTER destrutivo: peça confirmação em UMA frase.
- Ao criar novas tabelas em public, INCLUA na mesma query: GRANT SELECT,INSERT,UPDATE,DELETE ON public.<tabela> TO authenticated; GRANT ALL ON public.<tabela> TO service_role; ALTER TABLE public.<tabela> ENABLE ROW LEVEL SECURITY; CREATE POLICY.
- Você NÃO controla botões de status (Disponível/Pausa/Fechado) — 100% manuais.
- LIMITE TÉCNICO REAL: você opera no banco em tempo real, mas NÃO reescreve os arquivos .tsx do front-end em produção (isso passa pelo editor Lovable por segurança de build). Quando o CHEFE pedir mudança visual/de componente, entregue: (1) o SQL que já aplicou para preparar o banco, (2) o texto exato do prompt que ele deve colar no editor Lovable pra completar a parte visual.
- Sempre confirme o que fez em uma frase curta e prática.`;

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