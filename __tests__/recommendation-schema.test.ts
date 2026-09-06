import { RecommendationSchema } from "@/lib/types";

describe("Recommendation Schema Validation", () => {
  it("should validate a correct recommendation", () => {
    const valid = {
      summary: "Adjust production schedule by shifting batch 99 to Tuesday.",
      actionableSteps: ["Contact vendor", "Reschedule staff"],
      confidenceScore: 0.85,
      uncertaintyFactors: ["Weather unpredictability"],
    };
    expect(RecommendationSchema.safeParse(valid).success).toBe(true);
  });

  it("should fail if confidenceScore is out of range", () => {
    const invalid = {
      summary: "Valid summary here with enough length.",
      actionableSteps: ["Step 1"],
      confidenceScore: 1.5,
      uncertaintyFactors: ["Factor"],
    };
    expect(RecommendationSchema.safeParse(invalid).success).toBe(false);
  });

  it("should fail if actionableSteps is empty", () => {
    const invalid = {
      summary: "Valid summary here with enough length.",
      actionableSteps: [],
      confidenceScore: 0.5,
      uncertaintyFactors: ["Factor"],
    };
    expect(RecommendationSchema.safeParse(invalid).success).toBe(false);
  });
});
