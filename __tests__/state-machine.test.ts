import { SetReadyStateMachine, isValidTransition } from "@/lib/state-machine";

describe("State Machine", () => {
  it("should start in IDLE", () => {
    const sm = new SetReadyStateMachine();
    expect(sm.getState()).toBe("IDLE");
  });

  it("should transition correctly from IDLE to VALIDATING", () => {
    const sm = new SetReadyStateMachine();
    sm.transition("VALIDATING");
    expect(sm.getState()).toBe("VALIDATING");
  });

  it("should fail transition from IDLE to APPROVED", () => {
    const sm = new SetReadyStateMachine();
    sm.transition("APPROVED");
    expect(sm.getState()).toBe("STOPPED");
  });

  it("should transition to STOPPED on any invalid move", () => {
    const sm = new SetReadyStateMachine();
    sm.transition("AGENT_ANALYSIS");
    expect(sm.getState()).toBe("STOPPED");
  });

  it("should allow HUMAN_REVIEW -> APPROVED", () => {
    expect(isValidTransition("HUMAN_REVIEW", "APPROVED")).toBe(true);
  });

  it("should block IDLE -> APPROVED", () => {
    expect(isValidTransition("IDLE", "APPROVED")).toBe(false);
  });
});
