import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport, StreamableHTTPClientTransportOptions } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

/**
 * ClickHouse MCP Client
 * Uses official MCP SDK to connect to a ClickHouse server via Streamable HTTP.
 */

export class ClickHouseMCPClient {
  private client: Client | null = null;
  private transport: StreamableHTTPClientTransport | null = null;

  constructor(private serverUrl: string, private authToken?: string) {}

  async connect() {
    let finalUrl = this.serverUrl;
    if (!finalUrl.endsWith("/mcp")) {
      finalUrl = finalUrl.replace(/\/$/, "") + "/mcp";
    }
    const url = new URL(finalUrl);
    
    const options: StreamableHTTPClientTransportOptions = {};
    if (this.authToken) {
      options.requestInit = {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
        },
      };
    }
    
    this.transport = new StreamableHTTPClientTransport(url, options);
    this.client = new Client(
      { name: "setready-agent", version: "1.0.0" },
      { capabilities: {} }
    );
    await this.client.connect(this.transport);
  }

  async listTools() {
    if (!this.client) throw new Error("Client not connected");
    return await this.client.listTools();
  }

  async verifyRunQueryTool(): Promise<boolean> {
    const tools = await this.listTools();
    return tools.tools.some((t) => t.name === "run_query");
  }

  async executeQuery(sql: string, timeoutMs: number = 30000): Promise<any> {
    if (!this.client) throw new Error("Client not connected");

    const hasTool = await this.verifyRunQueryTool();
    if (!hasTool) {
      throw new Error("Critical Failure: run_query tool missing from MCP server.");
    }

    const result = await Promise.race([
      this.client.callTool({
        name: "run_query",
        arguments: { query: sql },
      }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("ClickHouse Query Timeout")), timeoutMs)
      ),
    ]);

    return result;
  }

  async close() {
    if (this.transport) {
      await this.transport.close();
    }
  }
}
