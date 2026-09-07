import os

import vertexai
from vertexai import agent_engines
from google.cloud.aiplatform_v1.types.env_var import SecretRef

from agent_runtime.agent import root_agent


PROJECT_ID = "setready-ai-hackathon"
LOCATION = "us-central1"

STAGING_BUCKET = os.environ["SETREADY_AGENT_STAGING_BUCKET"]
MCP_CLICKHOUSE_URL = os.environ["MCP_CLICKHOUSE_URL"]

app = agent_engines.AdkApp(agent=root_agent)

vertexai.init(
    project=PROJECT_ID,
    location=LOCATION,
    staging_bucket=STAGING_BUCKET,
)

remote_agent = agent_engines.update(
    resource_name=os.environ["SETREADY_AGENT_ENGINE_RESOURCE_NAME"],
    agent_engine=app,
    requirements="agent_runtime/requirements-agent-engine.txt",
    extra_packages=["agent_runtime"],
    display_name="SetReady AI",
    description=(
        "Film and television production disruption intelligence agent "
        "using Gemini, Google ADK, and the official ClickHouse MCP runtime."
    ),
    env_vars={
        "MCP_CLICKHOUSE_URL": MCP_CLICKHOUSE_URL,
        "MCP_SERVER_AUTH_TOKEN": SecretRef(
            secret="setready-mcp-auth-token",
            version="latest",
        ),
    },
    min_instances=0,
    max_instances=1,
)

print("=== AGENT ENGINE UPDATED ===")
print(remote_agent.resource_name)
