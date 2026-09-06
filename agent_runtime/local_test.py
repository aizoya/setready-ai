import asyncio
from vertexai import agent_engines

from agent_runtime.agent import root_agent

app = agent_engines.AdkApp(agent=root_agent)

async def main():
    async for event in app.async_stream_query(
        user_id="setready-local-test",
        message=(
            "A camera crane has failed before Scene 24. "
            "Estimated repair time is 6 hours. "
            "Explain what the 1st AD and UPM should review. "
            "Do not claim that any action was executed."
        ),
    ):
        print(event)

if __name__ == "__main__":
    asyncio.run(main())
