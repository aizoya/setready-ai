import { DisruptionSchema } from "@/lib/types";

describe("Disruption Validation", () => {
  it("should validate a correct disruption", () => {
    const valid = {
      eventType: "WEATHER",
      description: "Severe thunderstorm expected to last 4 hours.",
      estimatedImpactHours: 4,
      productionId: "PROD-ABC123",
    };
    expect(DisruptionSchema.safeParse(valid).success).toBe(true);
  });

  it("should fail on invalid eventType", () => {
    const invalid = {
      eventType: "ALIEN_INVASION",
      description: "Not a valid event type.",
      estimatedImpactHours: 1,
      productionId: "PROD-1",
    };
    expect(DisruptionSchema.safeParse(invalid).success).toBe(false);
  });

  it("should fail on too short description", () => {
    const invalid = {
      eventType: "LOGISTICS_DELAY",
      description: "Short.",
      estimatedImpactHours: 1,
      productionId: "PROD-1",
    };
    expect(DisruptionSchema.safeParse(invalid).success).toBe(false);
  });

  it("should fail on invalid productionId format", () => {
    const invalid = {
      eventType: "STRIKE",
      description: "Valid description here.",
      estimatedImpactHours: 1,
      productionId: "INVALID-ID",
    };
    expect(DisruptionSchema.safeParse(invalid).success).toBe(false);
  });
});
