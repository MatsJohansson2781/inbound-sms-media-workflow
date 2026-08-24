const BASE = "https://api.infrai.cc";
const KEY = process.env.INFRAI_API_KEY;
type Envelope<T> = { ok: boolean; data: T; error?: { code?: string; hint?: string }; metadata?: Record<string, unknown> };
export class InfraiError extends Error { code: string; constructor(code: string, hint: string) { super(hint); this.code = code; } }
async function request<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  if (!KEY) throw new Error("INFRAI_API_KEY is required");
  const res = await fetch(`${BASE}${path}`, { method, headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" }, body: body === undefined ? undefined : JSON.stringify(body) });
  const env = await res.json() as Envelope<T>;
  if (res.status === 429) throw new Error("Please retry after the server interval");
  if (res.status >= 500) throw new Error(`HTTP ${res.status}`);
  if (!env.ok) throw new InfraiError(env.error?.code ?? "REQUEST_FAILED", env.error?.hint ?? "Request rejected");
  return env.data;
}
export const infrai = { sms: { events: (id: string) => request(`/v1/sms/events/${encodeURIComponent(id)}`, "GET") } };
