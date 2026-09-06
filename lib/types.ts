import { z } from "zod";

/**
 * Disruption Input Schema
 * Validated before any external calls are made.
 */
export const DisruptionSchema = z.object({
  eventType: z.enum(["WEATHER", "EQUIPMENT_FAILURE", "LOGISTICS_DELAY", "STRIKE"]),
  description: z.string().min(10).max(500),
  estimatedImpactHours: z.number().positive().max(168), // Max 1 week
  productionId: z.string().regex(/^PROD-[A-Z0-9]+$/),
});

export type Disruption = z.infer<typeof DisruptionSchema>;

/**
 * Agent Recommendation Schema
 * Strictly validated to ensure the agent output is safe and actionable.
 */
export const RecommendationSchema = z.object({
  summary: z.string().min(20),
  actionableSteps: z.array(z.string().min(5)).min(1),
  confidenceScore: z.number().min(0).max(1),
  uncertaintyFactors: z.array(z.string()).min(1),
  sqlEvidence: z.string().optional(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>;

/**
 * State Machine States
 */
export type AgentState =
  | "IDLE"
  | "VALIDATING"
  | "CONTEXT_REQUESTED"
  | "CONTEXT_RECEIVED"
  | "AGENT_ANALYSIS"
  | "RECOMMENDATION_READY"
  | "HUMAN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "STOPPED";

/**
 * Evidence Trail Entry
 */
export interface EvidenceEntry {
  timestamp: string;
  state: AgentState;
  message: string;
  details?: any;
}
