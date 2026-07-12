import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const translateDailyInstruction = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input as { raw: string })
  .handler(async ({ data }) => {
    const { requireChefeSession } = await import("./chefe-auth.server");
    requireChefeSession();

    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY missing");
    const raw = (data.raw || "").trim();
    if (!raw) return { polite: "" };

    const gw = createLovableAiGatewayProvider(key);
    const model = gw("google/gemini-3-flash-preview");

    const result = await generateText({
      model,
      messages: [
        {
          role: "system",
          content:
            "Você é a Atendente Virtual da barbearia CHEFE. Traduza a instrução operacional que o barbeiro (CHEFE) mandou em uma mensagem clara, educada, curta (máx 2 frases), profissional e simpática, que será mostrada para o CLIENTE no início do chat de triagem. Use tom de porta-voz de alto nível, respeitoso. Fale sempre em português brasileiro. Não use aspas, não repita literalmente o comando do chefe — reescreva com postura profissional. Se fizer sentido, comece com um pequeno aviso ('⚠️ Aviso do CHEFE:' ou '📣 Recado do CHEFE:').",
        },
        { role: "user", content: raw },
      ],
    });

    return { polite: result.text.trim() };
  });