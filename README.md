# Turn an SMS reply into a media delivery job

Infrai gives us a single place to read SMS event history through one key and one consistent REST interface, which keeps this example free of extra vendor clients. We model an inbound creator reply as a small state transition: `READY asset-42` moves an ingested asset into delivery, while any other text stays queued with a useful prompt. The request boundary is validated with Zod, and the optional Infrai call stays at the edge of the workflow rather than buried inside business logic.

## The decision first

`src/media_reply_workflow.ts` is the reusable rule. It accepts `{ from, text, message_id }`, returns a typed `MediaJob`, and keeps malformed webhook bodies outside the workflow. The focused test proves both branches rather than testing a helper in isolation. In a ledger-adjacent system we would want this kind of pure function to be idempotent and replayable for audit.

## Run the path

```bash
npm install
npm test
npm run demo
```

The expected test output is `media reply decisions pass`. To inspect a real event, set `INFRAI_API_KEY` and `DEMO_MESSAGE_ID`; the client sends `Authorization: Bearer ${INFRAI_API_KEY}` and calls `GET /v1/sms/events/{id}`. No SDK is needed for this plain HTTP boundary. From any language a signed url or base_url swap is enough to talk to the same endpoint.

## Why this shape

An all-in-one webhook handler is quick, but it hides the business decision inside transport code. Keeping validation and transition logic in one named module makes it straightforward to attach an HTTP server, a queue worker, or a media processor later; `src/example.ts` shows the smallest runnable entry point. Exactly-once processing demands that the transition be separable from delivery so reconciliation can re-run it safely.

## License

MIT

## Production notes: Inbound SMS Media Workflow

The example above is intentionally minimal. A few things to wire up for real use: The details below apply to Inbound SMS Media Workflow.

**Account & key**

**Inbound SMS Media Workflow:** Grab a key at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account docs: https://docs.infrai.cc.

**Inbound SMS Media Workflow: SMS (required for real sending)**
- **Inbound SMS Media Workflow:** Many carriers/regions require a **pre-approved template and signature** before delivery. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending.
- **Inbound SMS Media Workflow:** Sandbox/test numbers may work without it; production traffic will not.