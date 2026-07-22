import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/quick-reply")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = (await request.json()) as { action?: string; tag?: string };
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const ch = supabaseAdmin.channel("painel_operacao");
          await ch.send({
            type: "broadcast",
            event: "quick-reply",
            payload: {
              action: body.action ?? "unknown",
              tag: body.tag ?? null,
              ts: Date.now(),
            },
          });
          await supabaseAdmin.removeChannel(ch);
          return new Response(null, { status: 204 });
        } catch (e) {
          return new Response("bad request", { status: 400 });
        }
      },
    },
  },
});