# SetReady AI — Submission Checklist

Deadline: September 9, 2026 at 2:00 PM PDT.

## Stage 1 — Runtime qualification

- [ ] Vercel project linked to `aizoya/setready-ai` under AIZOYA ownership
- [ ] preview deployment builds successfully
- [ ] Google Cloud authentication from Vercel succeeds
- [ ] Agent Platform API enabled and accessible
- [ ] SetReady custom agent ID configured, or approved development fallback documented
- [ ] ClickHouse service reachable
- [ ] official ClickHouse MCP server enabled/deployed
- [ ] `CLICKHOUSE_MCP_URL` configured
- [ ] MCP authentication configured
- [ ] one full SetReady run succeeds
- [ ] Agent Platform interaction ID visible
- [ ] ClickHouse MCP invocation visibly verified
- [ ] ClickHouse evidence write confirmed

## Stage 2 — Product QA

- [ ] desktop Chrome QA
- [ ] iPhone/mobile-width QA
- [ ] no horizontal overflow
- [ ] input validation works
- [ ] runtime failures present a clear error
- [ ] repeated runs work consistently
- [ ] no credentials or internal secrets appear in UI/log output
- [ ] production URL loads without authentication barriers for judges

## Stage 3 — Repository QA

- [x] public GitHub repository
- [x] root open-source `LICENSE`
- [x] source code demonstrates Google Cloud runtime use
- [x] source code demonstrates ClickHouse integration
- [x] official ClickHouse MCP is part of the required runtime path
- [x] environment contract documented
- [x] run/build instructions documented
- [ ] final verified branch merged into `main`
- [ ] final `main` commit corresponds to hosted submission

## Stage 4 — Demo video

- [ ] record actual hosted workflow
- [ ] <= 3 minutes
- [ ] English audio or English subtitles
- [ ] show disruption input
- [ ] show successful recommendation
- [ ] show Agent Platform evidence
- [ ] show ClickHouse MCP evidence
- [ ] show ClickHouse write evidence
- [ ] ensure no credentials are visible
- [ ] upload publicly to YouTube or Vimeo
- [ ] verify video in incognito/private browser

## Stage 5 — Devpost

- [ ] partner track: ClickHouse
- [ ] project name: SetReady AI
- [ ] hosted project URL
- [ ] public GitHub URL
- [ ] public 3-minute demo URL
- [ ] concise problem statement
- [ ] explain 1st AD / UPM target user
- [ ] explain Gemini Enterprise Agent Platform role
- [ ] explicitly explain official ClickHouse MCP runtime use
- [ ] explain deterministic validation/persistence boundary
- [ ] describe impact and future expansion without overstating current functionality
- [ ] verify all team/organization details
- [ ] final submission review
- [ ] submit before deadline

## Merge gate

Do not merge PR #2 merely because the code looks complete. Merge only after a hosted preview proves the mandatory runtime path. The final demo must depict the same substantive system represented by the submitted code and description.
