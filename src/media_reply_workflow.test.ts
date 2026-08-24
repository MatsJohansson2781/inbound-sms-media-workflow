import assert from "node:assert/strict";
import { handleInboundReply } from "./media_reply_workflow.js";
const delivered = handleInboundReply({ from: "+1555", text: "READY clip-7", message_id: "in-1" });
assert.equal(delivered.state, "delivered");
assert.equal(delivered.assetId, "clip-7");
const queued = handleInboundReply({ from: "+1555", text: "STATUS", message_id: "in-2" });
assert.equal(queued.state, "queued");
console.log("media reply decisions pass");
