import { NextRequest, NextResponse } from "next/server";
import { VertexAI } from "@google-cloud/vertexai";
import { DisruptionSchema, RecommendationSchema, EvidenceEntry } from "@/lib/types";
import { ClickHouseMCPClient } from "@/lib/mcp-client";
import { validateSQL } from "@/lib/sql-safety";

const project = process.env.GOOGLE_CLOUD_PROJECT || "setready-ai-hackathon";
const location = !process.env.GOOGLE_CLOUD_LOCATION || process.env.GOOGLE_CLOUD_LOCATION === "global" ? "us-central1" : process.env.GOOGLE_CLOUD_LOCATION;

const vertexAI = new VertexAI({ project, location });
const model = vertexAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export async function POST(req: NextRequest) {
  const evidence: EvidenceEntry[] = [];
  const addEvidence = (state: any, message: string, details?: any) => {
    evidence.push({ timestamp: new Date().toISOString(), state, message, details });
  };

  try {
    const body = await req.json();

    // 1. Zod Input Validation
    addEvidence("VALIDATING", "Validating disruption input");
    const disruption = DisruptionSchema.safeParse(body);
    if (!disruption.success) {
      addEvidence("STOPPED", "Invalid disruption input", disruption.error.format());
      return NextResponse.json({ error: "Invalid input", evidence }, { status: 400 });
    }

    // 2. MCP Context Retrieval
    addEvidence("CONTEXT_REQUESTED", "Connecting to ClickHouse MCP server");
    console.log("ROUTE LOG: MCP_CLICKHOUSE_URL =", process.env.MCP_CLICKHOUSE_URL);
    console.log("ROUTE LOG: MCP_SERVER_AUTH_TOKEN length =", process.env.MCP_SERVER_AUTH_TOKEN ? process.env.MCP_SERVER_AUTH_TOKEN.length : "undefined");
    console.log("ROUTE LOG: MCP_SERVER_AUTH_TOKEN prefix =", process.env.MCP_SERVER_AUTH_TOKEN ? process.env.MCP_SERVER_AUTH_TOKEN.substring(0, 10) : "undefined");
    const mcpClient = new ClickHouseMCPClient(
      process.env.MCP_CLICKHOUSE_URL || "",
      process.env.MCP_SERVER_AUTH_TOKEN
    );
    try {
      await mcpClient.connect();
      const hasTool = await mcpClient.verifyRunQueryTool();
      if (!hasTool) throw new Error("run_query tool not found");
      
      addEvidence("CONTEXT_RECEIVED", "Discovered run_query tool");

      // Agent-driven SQL generation via Gemini (Simplified for this route)
      // In a real scenario, this would be a tool-use loop.
      const prompt = `
        A disruption has occurred: ${disruption.data.description}
        Production ID: ${disruption.data.productionId}
        Estimated Impact: ${disruption.data.estimatedImpactHours} hours.

        I need to query the setready_events table to understand the impact.
        Generate a SELECT query for setready_events where production = '${disruption.data.productionId}'.
        Only output the SQL. Do NOT include any semicolons in the output.
      `;

      const sqlResult = await model.generateContent(prompt);
      const response = await sqlResult.response;
      let rawSQL = response.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/```sql|```/g, "") || "";
      rawSQL = rawSQL.trim().replace(/;+$/, "").trim();
      
      addEvidence("AGENT_ANALYSIS", "Generated SQL query", { rawSQL });

      // SQL Safety Check
      const safetyCheck = validateSQL(rawSQL);
      if (!safetyCheck.isValid) {
        throw new Error(`SQL Safety Violation: ${safetyCheck.error}`);
      }

      const queryResult = await mcpClient.executeQuery(safetyCheck.sanitizedSQL);
      
      // Parse row count from ClickHouse queryResult to check for empty result set
      let rowCount = 0;
      try {
        if (
          queryResult &&
          Array.isArray(queryResult.content) &&
          queryResult.content[0] &&
          queryResult.content[0].type === "text"
        ) {
          const parsed = JSON.parse(queryResult.content[0].text);
          if (parsed && Array.isArray(parsed.rows)) {
            rowCount = parsed.rows.length;
          }
        }
      } catch {
        // Safe fallback / parse failure
      }

      if (rowCount === 0) {
        throw new Error("CONTEXT_UNAVAILABLE: Insufficient database context to generate a recommendation.");
      }

      addEvidence("CONTEXT_RECEIVED", "Context retrieved from ClickHouse", { result: queryResult });

      // 3. Agent Recommendation Generation
      const finalPrompt = `
        Based on the disruption data: ${JSON.stringify(disruption.data)}
        And the production schedule from ClickHouse: ${JSON.stringify(queryResult)}
        
        Provide a recommendation for the production manager.
        The output MUST be a valid JSON object matching this schema:
        {
          "summary": "...",
          "actionableSteps": ["...", "..."],
          "confidenceScore": 0.0 to 1.0,
          "uncertaintyFactors": ["...", "..."]
        }
      `;

      const recommendationResult = await model.generateContent(finalPrompt);
      const recResponse = await recommendationResult.response;
      const recommendationText = recResponse.candidates?.[0]?.content?.parts?.[0]?.text?.trim().replace(/```json|```/g, "") || "{}";
      
      let recommendation;
      try {
        recommendation = JSON.parse(recommendationText);
      } catch {
        throw new Error("Gemini output was not valid JSON");
      }

      // 4. Strict Recommendation Validation
      const validRecommendation = RecommendationSchema.safeParse({
        ...recommendation,
        sqlEvidence: safetyCheck.sanitizedSQL
      });

      if (!validRecommendation.success) {
        addEvidence("STOPPED", "Recommendation validation failed", validRecommendation.error.format());
        return NextResponse.json({ error: "Agent produced malformed recommendation", evidence }, { status: 500 });
      }

      addEvidence("RECOMMENDATION_READY", "Recommendation generated successfully");
      return NextResponse.json({ recommendation: validRecommendation.data, evidence });

    } catch (error: any) {
      addEvidence("STOPPED", "Critical failure during processing", { error: error.message });
      return NextResponse.json({ error: error.message, evidence }, { status: 500 });
    } finally {
      await mcpClient.close();
    }

  } catch (error: any) {
    return NextResponse.json({ error: "Internal Server Error", message: error.message }, { status: 500 });
  }
}
