import { AgentState } from "./types";

/**
 * Deterministic State Machine for SetReady AI Agent
 * Ensures valid transitions and prevents unauthorized approvals.
 */

const VALID_TRANSITIONS: Record<AgentState, AgentState[]> = {
  IDLE: ["VALIDATING"],
  VALIDATING: ["CONTEXT_REQUESTED", "STOPPED"],
  CONTEXT_REQUESTED: ["CONTEXT_RECEIVED", "STOPPED"],
  CONTEXT_RECEIVED: ["AGENT_ANALYSIS", "STOPPED"],
  AGENT_ANALYSIS: ["RECOMMENDATION_READY", "STOPPED"],
  RECOMMENDATION_READY: ["HUMAN_REVIEW", "STOPPED"],
  HUMAN_REVIEW: ["APPROVED", "REJECTED", "STOPPED"],
  APPROVED: ["IDLE"],
  REJECTED: ["IDLE"],
  STOPPED: ["IDLE"],
};

export function isValidTransition(from: AgentState, to: AgentState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

export class SetReadyStateMachine {
  private currentState: AgentState = "IDLE";

  getState(): AgentState {
    return this.currentState;
  }

  transition(to: AgentState): void {
    if (isValidTransition(this.currentState, to)) {
      this.currentState = to;
    } else {
      console.error(`Invalid transition from ${this.currentState} to ${to}`);
      this.currentState = "STOPPED";
    }
  }

  reset(): void {
    this.currentState = "IDLE";
  }
}
