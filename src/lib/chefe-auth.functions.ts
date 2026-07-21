import { createServerFn } from "@tanstack/react-start";

// Client-callable RPC glue. Actual crypto/cookie logic lives in
// chefe-auth.server.ts and is loaded dynamically so it never ships to the
// client bundle.

export const chefeLogin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => input as { pin: string })
  .handler(async ({ data }) => {
    const auth = await import("./chefe-auth.server");
    if (!auth.verifyPin(data.pin)) {
      auth.checkPinRateLimit();
      auth.registerPinFailure();
      return { ok: false as const };
    }
    auth.clearPinFailures();
    auth.establishChefeSession();
    return { ok: true as const };
  });

export const chefeLogout = createServerFn({ method: "POST" }).handler(async () => {
  const auth = await import("./chefe-auth.server");
  auth.clearChefeSession();
  return { ok: true as const };
});

export const chefeCheckSession = createServerFn({ method: "GET" }).handler(async () => {
  const auth = await import("./chefe-auth.server");
  return { authenticated: auth.hasValidChefeSession() };
});
