// Public VAPID key. Safe to expose — signing uses the private key server-side.
export const VAPID_PUBLIC_KEY =
  "BF206B4hRAx2-f7850Fwzq6KIBY6orx9sxRNh0yPRVNE7sULpqRqyJJj8IDuR-0q22pB8hrNebKXrVIP2p73z-Q";

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}