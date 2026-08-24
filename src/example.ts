import { handleInboundReply } from "./media_reply_workflow.js";
import { infrai } from "./infrai_sms.js";
const input = { from: process.env.DEMO_CREATOR ?? "+15550001111", text: process.env.DEMO_TEXT ?? "READY asset-42", message_id: "demo-1" };
const job = handleInboundReply(input);
console.log(job);
if (process.env.INFRAI_API_KEY && process.env.DEMO_MESSAGE_ID) console.log(await infrai.sms.events(process.env.DEMO_MESSAGE_ID));
