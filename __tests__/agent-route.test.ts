import { POST } from "@/app/api/agent/route";
import { NextRequest } from "next/server";

describe("Agent API Route", () => {
  it("should return 400 on invalid Zod input", async () => {
    const req = new NextRequest("http://localhost:3000/api/agent", {
      method: "POST",
      body: JSON.stringify({ eventType: "INVALID" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid input");
  });
});
