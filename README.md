# SetReady AI

Clean-room implementation of the AI-driven production disruption management system.

## Architecture

This project follows the **Google Cloud agent backend** architecture using **Gemini 3.7 Flash** and the **Gemini Enterprise Agent Platform API** terminology.

### Key Components

1.  **Next.js App Router**: Root-level `app/` structure for frontend and API.
2.  **Gemini 3.7 Flash**: High-speed, low-latency agent reasoning.
3.  **MCP (Model Context Protocol)**: Official SDK integration for ClickHouse connectivity.
4.  **SQL Safety Layer**: Defense-in-depth SQL validation (SELECT only, table allowlist, enforced limits).
5.  **Deterministic State Machine**: Strict transition logic (IDLE -> VALIDATING -> ... -> RECOMMENDATION_READY -> HUMAN_REVIEW -> APPROVED/REJECTED).
6.  **Zod Validation**: Strict schema enforcement for inputs and agent recommendations.

### Tech Stack

-   **Frontend**: React 19, Tailwind CSS, Lucide Icons.
-   **Backend**: Next.js 15 API Routes.
-   **AI**: Gemini 3.7 Flash via `@google/generative-ai`.
-   **Database Access**: MCP SDK via `@modelcontextprotocol/sdk`.
-   **Testing**: Jest, ts-jest, React Testing Library.

## Safety & Security

-   **Fail-Closed**: Any validation failure or unexpected error transitions the agent to a `STOPPED` state and halts processing.
-   **SQL Defense**: 
    -   Only `SELECT` statements are allowed.
    -   Approved table allowlist: `production_schedule`.
    -   Mandatory `LIMIT` enforcement.
    -   No DML/DDL/SYSTEM statements.
-   **Human-in-the-Loop**: No action can be taken without explicit `HUMAN_REVIEW` and approval.

## Environment Variables

Copy `.env.example` to `.env` and fill in:

-   `GOOGLE_GENERATIVE_AI_API_KEY`: Gemini API key.
-   `CLICKHOUSE_MCP_SERVER_URL`: URL of the ClickHouse MCP server.

## Getting Started

1.  `npm install`
2.  `npm run dev`
3.  `npm test`

## Project Structure

-   `app/api/agent/route.ts`: Core agent logic.
-   `lib/`: Core utilities and safety layers.
-   `__tests__/`: Automated test suite.
