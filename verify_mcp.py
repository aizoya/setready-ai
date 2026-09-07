import os, json, time, asyncio
import pandas as pd
from datetime import datetime, timezone
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# Automatically load from .env if present in current or parent directory
for env_path in [".env", "../.env"]:
    if os.path.exists(env_path):
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    k, v = line.split("=", 1)
                    os.environ.setdefault(k.strip(), v.strip().strip("'\""))

# If custom host is not set, use play.clickhouse.com (port 443, user: play)
host = os.getenv("CLICKHOUSE_HOST", "play.clickhouse.com")
user = os.getenv("CLICKHOUSE_USER", "play")
password = os.getenv("CLICKHOUSE_PASSWORD", "")
port = os.getenv("CLICKHOUSE_PORT", "443")
secure = os.getenv("CLICKHOUSE_SECURE", "true")

runtime_audit_trail = []

def record_mcp_event(event_type, tool_name, payload, latency_ms, status):
    runtime_audit_trail.append({
        "timestamp_utc": datetime.now(timezone.utc).isoformat(),
        "event_type": event_type,
        "mcp_server": "official/mcp-clickhouse",
        "tool_invoked": tool_name,
        "latency_ms": round(latency_ms, 2),
        "runtime_status": status
    })

async def verify_clickhouse_mcp():
    server_params = StdioServerParameters(
        command="uvx",
        args=["mcp-clickhouse"],
        env={
            "CLICKHOUSE_HOST": host,
            "CLICKHOUSE_USER": user,
            "CLICKHOUSE_PASSWORD": password,
            "CLICKHOUSE_PORT": port,
            "CLICKHOUSE_SECURE": secure,
            "CLICKHOUSE_ALLOW_WRITE_ACCESS": "false"
        }
    )
    print(f"Connecting to official mcp-clickhouse server ({host}:{port} as {user})...")
    
    t0 = time.perf_counter()
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # 1. Initialize
            await session.initialize()
            record_mcp_event("JSON-RPC:initialize", "system", {}, (time.perf_counter() - t0) * 1000, "SUCCESS")

            # 2. List Tools
            t1 = time.perf_counter()
            tools = await session.list_tools()
            names = [t.name for t in tools.tools]
            record_mcp_event("JSON-RPC:tools/list", "system", {"tools_count": len(names)}, (time.perf_counter() - t1) * 1000, "SUCCESS")
            print(f"Discovered Tools: {names}")

            # 3. Execute Runtime Analytical Query
            t2 = time.perf_counter()
            q = "SELECT 'Agentic Cinema Verification' AS test, version() AS ch_version, now() AS timestamp_utc"
            tool_to_call = "run_query" if "run_query" in names else names[0]
            res = await session.call_tool(tool_to_call, arguments={"query": q})

            status = "SUCCESS" if not res.isError else "ERROR"
            record_mcp_event(
                "JSON-RPC:tools/call",
                tool_to_call,
                {"query": q},
                (time.perf_counter() - t2) * 1000,
                status
            )
            
            if res.isError:
                print("Error payload:", res.content)
            else:
                print("Query executed successfully on live ClickHouse cluster!")

if __name__ == "__main__":
    asyncio.run(verify_clickhouse_mcp())
    df = pd.DataFrame(runtime_audit_trail)
    print("\n" + "="*80)
    print("OFFICIAL CLICKHOUSE MCP RUNTIME VERIFICATION REPORT")
    print("="*80)
    print(df.to_string(index=False))
    
    with open("clickhouse_mcp_runtime_proof.json", "w") as f:
        json.dump(runtime_audit_trail, f, indent=2)
    print("\nSaved proof artifact to: 'clickhouse_mcp_runtime_proof.json'")
