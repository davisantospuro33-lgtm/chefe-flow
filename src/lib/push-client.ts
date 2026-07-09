import { supabase } from "@/integrations/supabase/client";
import { VAPID_PUBLIC_KEY, urlBase64ToUint8Array } from "./vapid";

let swRegPromise: Promise<ServiceWorkerRegistration> | null = null;

export async function ensureServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === "undefined") return null;
  if (!("serviceWorker" in navigator)) return null;
  if (!swRegPromise) {
    swRegPromise = navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      await navigator.serviceWorker.ready;
      return reg;
    });
  }
  return swRegPromise;
}

export async function subscribeToPush(clientName?: string): Promise<boolean> {
  try {
    if (typeof window === "undefined") return false;
    if (!("Notification" in window) || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }
    const perm = await Notification.requestPermission();
    if (perm !== "granted") return false;
    const reg = await ensureServiceWorker();
    if (!reg) return false;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
    }
    const json = sub.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return false;
    await supabase
      .from("chefe_push_subscriptions")
      .upsert(
        {
          endpoint: json.endpoint,
          p256dh: json.keys.p256dh,
          auth: json.keys.auth,
          client_name: clientName ?? null,
        },
        { onConflict: "endpoint" },
      );
    return true;
  } catch (err) {
    console.error("subscribeToPush error", err);
    return false;
  }
}