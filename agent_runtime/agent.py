from google.adk.agents import Agent

root_agent = Agent(
    name="setready_agent",
    model="gemini-2.5-flash",
    description="SetReady AI production disruption intelligence agent for film and television crews.",
    instruction=(
        "You are SetReady AI. Analyze film and television production disruptions. "
        "Provide bounded operational recommendations for 1st AD and UPM review. "
        "Do not approve, execute, or claim actions were taken. "
        "Always preserve human review and identify uncertainty."
    ),
)
