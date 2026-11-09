# ASCENSION candidate — AI Mastery Atlas

**Status: IMPLEMENTED / TESTED; NOT DEPLOYED.** This is a bounded first slice of the 27-section brief, not a completed flagship transformation. Session model identity and reasoning effort could not be attested: **MODEL NOT VERIFIED**. No other AI model or subagent was used.

## Baseline and preservation

- Canonical Site: `appgprj_6a93e4e3ba208191a77957b1fa58fed7`.
- URL and public audience remain unchanged: https://ai-mastery-atlas.phenlleyniron.chatgpt.site/.
- Native repository, branch `main`; baseline `7abcb366c2d4b65202946b431a5d56d197cc2588`, saved Site version 73.
- Existing release/rollback version: `appgprj_6a93e4e3ba208191a77957b1fa58fed7~appgver_6b909fcbf8dc8191825fb3167244f350`.
- The 500-hour / 180-module / 43-track curriculum and its evidence semantics are preserved. Existing arithmetic and integrity tests pass; this is not a manual audit of every educational claim.
- No learner records, databases, entitlements, access policies or other Sites were changed. Cell Architecture Studio was not opened or edited.

## Implemented

The Evaluation Workbench now records a frozen task, input fixture/version, scoring source, allowed tools, baseline, claimed evaluator provenance, repetition/retries, optional measured latency/correction effort, failure notes, remediation and identical-test verification reference. Comparability groups require matching task, fixture, source, tools, baseline and rubric. Legacy records remain available without invented protocol metadata. Group labels and reviewer labels remain user claims; Atlas neither inspects artifacts nor authenticates evaluators.

Evaluation imports reject oversized backups, duplicate IDs, unsafe keys, unknown schemas, impossible dates, invalid scores, non-finite object values and malformed protocol fields. Failed or missing results are not filled in. Normal saves merge committed records so a stale same-tab callback cannot silently discard a result. Other-tab baseline mismatches block replacement.

An explicit Restore valid backup action validates first, asks for confirmation, preserves exact previous bytes in a recovery copy, and resumes saving after an unreadable local record. Stored-original and recovery exports preserve exact bytes. A failed recovery write blocks replacement.

The existing local key remains `atlas-evaluation-v1`. Current payloads/exports use `atlas-evaluation-v2`; v1 backups still import. Export the complete v2 backup before a rollback. The explicitly labelled v1 scoring export omits protocol metadata for use with older releases. Nothing auto-migrates merely from viewing the page.

The dated current guide corrects the expired GPT-5.5 notice. The official notice specifies retirement from Codex for ChatGPT-authenticated users on 14 October 2026 at 19:00 UTC; API and API-key-authenticated Codex sessions are unaffected. Source checked 16 October 2026: https://learn.chatgpt.com/docs/models. Other dated claims were not relabelled as freshly verified.

## Verification

Environment: Node 24.19.0, npm 11.9.0, TypeScript 5.9.3, React 19.2.6, Vite 8.0.13, Vinext 0.0.50.

- Baseline `npm test`: 172 PASS, 42 SKIPPED, 0 FAIL.
- Candidate `npm test`: 181 PASS, 42 SKIPPED, 0 FAIL; production build passed.
- `node node_modules/typescript/bin/tsc --noEmit`: PASS.
- ESLint on changed TS/TSX/test files: PASS. Full-repository lint: FAIL on the unchanged synchronous theme script in `app/layout.tsx`; existing warnings remain.
- New deterministic checks cover v1/v2 round-trips, comparability, malformed protocols, unsafe/oversized imports, merge conflicts, exact damaged-byte recovery, interrupted writes, stale tabs and rapid same-tab saves. SSR checks cover labelled controls and empty-state honesty.
- The 42 skipped tests require external study-library corpus fixtures not provided here; they are not passes.
- Existing production homepage: HTTP 200 and V7 marker observed. Browser interaction, compact-mobile layout, keyboard operation and live candidate behavior: BLOCKED / NOT RUN.

## Release holds and next work

No production publication was attempted. Full dependency audit reports 29 package findings (22 high, 6 moderate, 1 low, 0 critical). Counts include development/transitive packages and do not establish exploitability. Triage runtime exposure and compatible fixes before release; do not force automatic major upgrades of the Sites/Vinext stack. Whole-repository lint and browser gates remain open. Model identity remains unverified.

The full model registry refresh, 159-link health audit, entire curriculum/content review, command-centre improvements, additional evaluation labs, performance measurements and manual accessibility audit remain unfinished. There are no field Web Vitals, Lighthouse scores, student studies or new live-release claims.

## Owner use after a verified release

Record one actual run with a stable public/synthetic fixture reference and checked scoring source. Expand Access, repetitions and failure analysis when needed. Keep failed runs, unknown costs and unmeasured baselines honest. Export the full backup before moving devices or versions. To recover an unreadable ledger, first export its original bytes, then restore a known valid backup; inspect the recovery copy before deleting anything. A passing rubric remains a self-recorded task result, not certified mastery.
