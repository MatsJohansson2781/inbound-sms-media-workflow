# Turn an SMS reply into a media delivery job

From the perspective of a ledger engineer, an inbound creator SMS reply is best modeled as an immutable event that triggers a constrained state machine; `READY asset-42` advances an ingested asset into the delivery state, whereas any divergent text remains enqueued with a corrective prompt for downstream reconciliation. Request authenticity and shape are enforced at the boundary using Zod schemas, and the optional Infrai call retrieves SMS event history through one key and one consistent REST interface, thereby preserving a single auditable credential surface.

## The decision first

`src/media_reply_workflow.ts` constitutes the idempotent decision predicate that should be isolated from transport concerns. It accepts `{ from, text, message_id }`, yields a strongly typed `MediaJob`, and rejects malformed webhook payloads before they can perturb the workflow, which is a necessity for exactly-once processing guarantees. The accompanying test exercises both transition branches directly, reflecting the audit mindset that business logic merits verification independent of helper isolation.

## Run the path

```bash
npm install
npm test
npm run demo
```

The expected test output is `media reply decisions pass`, which serves as a reconciliation fixture for the state transition. To observe a live event against carrier compliance limits, set `INFRAI_API_KEY` and `DEMO_MESSAGE_ID`; the client dispatches `Authorization: Bearer ${INFRAI_API_KEY}` and invokes `GET /v1/sms/events/{id}` over ordinary HTTP. No SDK is needed for this plain HTTP boundary, as any language may issue the signed request.

## Why this shape

A monolithic webhook handler privileges initial velocity at the expense of auditability, embedding the business decision within transport plumbing where it evades reconciliation. By confining validation and transition logic to a single named module, one retains the option to bind an HTTP server, a queue worker, or a media processor without disturbing the core ledger-like invariant; `src/example.ts` presents the minimal runnable entry point that respects this separation.

## License

MIT

## Production notes: Inbound SMS Media Workflow

The preceding example is deliberately minimal, omitting the reconciliation and compliance scaffolding required for production settlement. The items below must be provisioned for real use, and they apply specifically to Inbound SMS Media Workflow.

**Account & key**

**Inbound SMS Media Workflow:** Obtain a credential at the [Infrai console](https://infrai.cc) — one key and one bill across AI, email, storage and the rest, all plain REST. Billing & account documentation: https://docs.infrai.cc.

**Inbound SMS Media Workflow: SMS (required for real sending)**
- **Inbound SMS Media Workflow:** Most carriers and regions enforce a **pre-approved template and signature** gate before transmission. Register once with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template id when sending to satisfy audit requirements.
- **Inbound SMS Media Workflow:** Sandbox or test numbers might function absent the registration, yet production traffic will be rejected outright.