# SetReady AI

SetReady AI is an AI production-intelligence agent for film and television crews, being built for the Agentic Cinema — The Blockbuster Hackathon.

## Hackathon stack

- Gemini
- Google Cloud
- Gemini Enterprise Agent Platform (current Google Cloud product naming; formerly Vertex AI)
- Agent Builder capabilities as required by the competition
- ClickHouse partner-track runtime integration
- Next.js + TypeScript

> Compatibility note: Google Cloud has updated the Vertex AI product naming to Gemini Enterprise Agent Platform. Existing API/service identifiers may retain Vertex-era names (for example, `aiplatform.googleapis.com`). SetReady documentation uses current product terminology while preserving the identifiers required by Google Cloud and the competition.

## Demo scope

The submission is intentionally focused on one production-operations golden path:

Production disruption → deterministic validation → Gemini analysis → ClickHouse runtime context/storage → operational impact assessment → bounded recommendation for the 1st AD / UPM → visible evidence/audit trail.

Runtime integrations are not considered complete until verified with evidence.
