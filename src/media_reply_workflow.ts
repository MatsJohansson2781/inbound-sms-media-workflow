import { z } from "zod";
export const inboundReplySchema = z.object({ from: z.string().min(1), text: z.string().min(1), message_id: z.string().min(1) });
export type InboundReply = z.infer<typeof inboundReplySchema>;
export type MediaJob = { assetId: string; creator: string; state: "queued" | "delivered"; reply: string };
export function handleInboundReply(input: unknown): MediaJob {
  const reply = inboundReplySchema.parse(input);
  const match = reply.text.trim().match(/^READY\s+(\S+)$/i);
  if (!match) return { assetId: reply.message_id, creator: reply.from, state: "queued", reply: "Reply READY <asset-id> when the media is ready." };
  return { assetId: match[1], creator: reply.from, state: "delivered", reply: `Delivery queued for ${match[1]}.` };
}
