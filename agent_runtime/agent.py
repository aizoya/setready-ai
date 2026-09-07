import os

from google.adk.agents import Agent
from google.adk.tools.mcp_tool.mcp_session_manager import (
    StreamableHTTPConnectionParams,
)
from google.adk.tools.mcp_tool.mcp_toolset import McpToolset


MCP_CLICKHOUSE_URL = os.environ["MCP_CLICKHOUSE_URL"]
MCP_SERVER_AUTH_TOKEN = os.environ["MCP_SERVER_AUTH_TOKEN"]


clickhouse_tools = McpToolset(
    connection_params=StreamableHTTPConnectionParams(
        url=f"{MCP_CLICKHOUSE_URL.rstrip('/')}/mcp",
        headers={
            "Authorization": f"Bearer {MCP_SERVER_AUTH_TOKEN}",
        },
        timeout=60.0,
        sse_read_timeout=300.0,
    ),
    tool_filter=["run_query"],
)


root_agent = Agent(
    name="setready_agent",
    model="gemini-2.5-flash",
    description=(
        "SetReady AI production disruption intelligence agent "
        "for film and television crews."
    ),
    instruction=(
        "You are SetReady AI, an operational intelligence agent for "
        "film and television production crews. "
        "Use the available ClickHouse run_query tool when production "
        "evidence is needed. "
        "Only perform read-only SELECT queries. "
        "Never use INSERT, UPDATE, DELETE, ALTER, DROP, CREATE, TRUNCATE, "
        "or other mutating SQL. "
        "Analyze production disruptions and provide bounded operational "
        "recommendations for 1st AD and UPM review. "
        "Never claim that a recommendation was approved or executed. "
        "Always preserve human review and identify uncertainty."
    ),
    tools=[clickhouse_tools],
)
