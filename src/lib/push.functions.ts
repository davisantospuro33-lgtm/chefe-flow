import { createServerFn } from "@tanstack/react-start";

export const broadcastPush = createServerFn({ method: "POST" })
  .inputValidator(
    (input: unknown) =>
      input as {
        title: string;
        body: string;
        url?: string;
        requireInteraction?: boolean;
        tag?: string;
        image?: string;
        actions?: { action: string; title: string; icon?: string }[];
        action_map?: Record<string, string>;
      },
  )
  .handler(async ({ data }) => {
    const { requireChefeSession } = await import("./chefe-auth.server");
    requireChefeSession();

    const pub = process.env.VAPID_PUBLIC_KEY;
    const priv = process.env.VAPID_PRIVATE_KEY;
    const subject = process.env.VAPID_SUBJECT || "mailto:contato@chefe.app";
    if (!pub || !priv) return { sent: 0, error: "VAPID keys missing" };

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { default: webpush } = await import("web-push");
    webpush.setVapidDetails(subject, pub, priv);

    const { data: subs } = await supabaseAdmin
      .from("chefe_push_subscriptions")
      .select("id, endpoint, p256dh, auth");
    if (!subs || subs.length === 0) return { sent: 0 };

    const payload = JSON.stringify({
      title: data.title,
      body: data.body,
      url: data.url ?? "/",
      requireInteraction: data.requireInteraction ?? true,
      tag: data.tag ?? "chefe-status",
      image: data.image,
      actions: data.actions ?? [],
      action_map: data.action_map ?? {},
    });

    let sent = 0;
    const stale: string[] = [];
    await Promise.all(
      subs.map(async (s) => {
        try {
          await webpush.sendNotification(
            { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
            payload,
          );
          sent++;
        } catch (err: unknown) {
          const status = (err as { statusCode?: number })?.statusCode;
          if (status === 404 || status === 410) stale.push(s.id);
        }
      }),
    );
    if (stale.length > 0) {
      await supabaseAdmin.from("chefe_push_subscriptions").delete().in("id", stale);
    }
    return { sent };
  });