import { ClickHouseMCPClient } from "@/lib/mcp-client";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

jest.mock("@modelcontextprotocol/sdk/client/index.js");
jest.mock("@modelcontextprotocol/sdk/client/streamableHttp.js", () => {
  return {
    StreamableHTTPClientTransport: jest.fn().mockImplementation(() => {
      return {
        close: jest.fn(),
      };
    }),
  };
});

describe("ClickHouse MCP Client", () => {
  let mcpClient: ClickHouseMCPClient;

  beforeEach(() => {
    jest.clearAllMocks();
    mcpClient = new ClickHouseMCPClient("http://localhost:8080");
  });

  it("should fail if run_query tool is missing", async () => {
    (Client.prototype.listTools as jest.Mock).mockResolvedValue({ tools: [] });
    // Manually setting private client to bypass connect for unit test
    (mcpClient as any).client = new Client({name:'t', version:'1'}, {capabilities:{}});
    
    await expect(mcpClient.executeQuery("SELECT 1")).rejects.toThrow("run_query tool missing");
  });

  it("should call callTool when tool exists", async () => {
    (Client.prototype.listTools as jest.Mock).mockResolvedValue({ tools: [{ name: "run_query" }] });
    (Client.prototype.callTool as jest.Mock).mockResolvedValue({ content: [{ type: "text", text: "result" }] });
    (mcpClient as any).client = new Client({name:'t', version:'1'}, {capabilities:{}});

    const result = await mcpClient.executeQuery("SELECT 1");
    expect(Client.prototype.callTool).toHaveBeenCalledWith({
      name: "run_query",
      arguments: { query: "SELECT 1" },
    });
    expect(result).toBeDefined();
  });

  it("should format URL and connect with StreamableHTTPClientTransport when URL has no /mcp", async () => {
    const client = new ClickHouseMCPClient("http://localhost:8080", "secret-token");
    await client.connect();

    expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
      new URL("http://localhost:8080/mcp"),
      {
        requestInit: {
          headers: {
            Authorization: "Bearer secret-token",
          },
        },
      }
    );
    expect(Client.prototype.connect).toHaveBeenCalled();
  });

  it("should format URL correctly if it already has /mcp and trailing slash", async () => {
    const client = new ClickHouseMCPClient("http://localhost:8080/mcp/", "secret-token");
    await client.connect();

    expect(StreamableHTTPClientTransport).toHaveBeenCalledWith(
      new URL("http://localhost:8080/mcp"),
      {
        requestInit: {
          headers: {
            Authorization: "Bearer secret-token",
          },
        },
      }
    );
  });
});
