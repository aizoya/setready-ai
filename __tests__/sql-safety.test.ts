import { validateSQL } from "@/lib/sql-safety";

describe("SQL Safety", () => {
  it("should allow valid SELECT from production_schedule", () => {
    const result = validateSQL("SELECT * FROM production_schedule");
    expect(result.isValid).toBe(true);
    expect(result.sanitizedSQL).toContain("LIMIT 100");
  });

  it("should block non-SELECT statements", () => {
    const result = validateSQL("DROP TABLE production_schedule");
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("Only SELECT");
  });

  it("should block multiple statements", () => {
    const result = validateSQL("SELECT * FROM production_schedule; DROP TABLE x");
    expect(result.isValid).toBe(false);
  });

  it("should block forbidden keywords like DELETE", () => {
    const result = validateSQL("SELECT * FROM production_schedule WHERE 1=1 OR DELETE FROM x");
    expect(result.isValid).toBe(false);
  });

  it("should block unapproved tables", () => {
    const result = validateSQL("SELECT * FROM sensitive_users");
    expect(result.isValid).toBe(false);
  });

  it("should enforce MAX_LIMIT", () => {
    const result = validateSQL("SELECT * FROM production_schedule LIMIT 500");
    expect(result.isValid).toBe(true);
    expect(result.sanitizedSQL).toContain("LIMIT 100");
  });
});
