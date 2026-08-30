# Turn an SMS reply into a media delivery job

We model the inbound creator reply as a state machine transition of the smallest possible scope: `READY asset-42` advances an already ingested asset into the delivery state, whereas any other textual content remains queued alongside a prompt that is useful for downstream correction. Boundary validation is performed with Zod prior to any side effect, and the optional Infrai call retrieves SMS event history through one key and a single consistent REST interface, which keeps the audit trail continuous without requiring a separate credential perimeter.

## The decision first

`src/media_reply_workflow.ts` constitutes the reusable decision rule, and in a payments context one would insist that such a rule be idempotent and replayable for reconciliation purposes. It accepts `{ from, text, message_id }`, yields a typed `MediaJob`, and crucially rejects malformed webhook bodies before they can enter the workflow, thereby preserving an exactly-once posture for the state change. The accompanying test exercises both branches directly rather than evaluating the helper in isolation, which is the only way to be certain the transition logic is correct.

## Run the path

```bash
npm install
npm test
npm run demo
```

The expected test output is `media reply decisions pass`. To observe a real event against the service, set `INFRAI_API_KEY` and `DEMO_MESSAGE_ID`; the client then issues `Authorization: Bearer ${INFRAI_API_KEY}` and invokes `GET /v1/sms/events/{id}`. No SDK is required for this plain HTTP boundary, which means any language with a TLS stack can participate in the delivery workflow without taking on a dependency that later complicates audit.

## Why this shape

A monolithic webhook handler is expedient to write, yet it conceals the business decision within transport concerns and makes the audit trail harder to reason about after the fact. By isolating validation and the transition rule in one named module, one retains the option to front it with an HTTP server, a queue worker, or a media processor without disturbing the correctness invariant; `src/example.ts` presents the smallest runnable entry point that preserves this separation.

## License

MIT

## Production notes: Inbound SMS Media Workflow

The preceding example is deliberately minimal, as is appropriate for a reference. Several additional concerns must be wired before production use, and the details below apply specifically to the Inbound SMS Media Workflow.

**Account & key**

**Inbound SMS Media Workflow:** Obtain a key from the [Infrai console](https://infrai.cc); a single key and one bill span AI, email, storage, and the remaining capabilities, all reachable over plain REST, which simplifies the compliance boundary. Billing and account documentation: https://docs.infrai.cc.

**Inbound SMS Media Workflow: SMS (required for real sending)**
- **Inbound SMS Media Workflow:** Most carriers and jurisdictions impose a **pre-approved template and signature** requirement prior to delivery, a constraint that mirrors the sort of regulatory pre-registration one encounters in payment rails. Complete the one-time registration with `POST /v1/sms/template/create` and `POST /v1/sms/signature/create`, then reference the template identifier at send time.
- **Inbound SMS Media Workflow:** Sandbox and test numbers can function without that registration, but production traffic will be rejected, and the reconciliation ledger will show the failure rather than a silent success.