import json
from services.tool_registry import tool_registry


# -----------------------------
# SAFE TOOL PARSING
# -----------------------------
def extract_tool_call(text: str):
    """
    Accepts strict JSON output from LLM:

    {
      "tool_call": {
        "name": "tool_name",
        "args": {}
      }
    }
    """

    try:
        data = json.loads(text)

        if isinstance(data, dict) and "tool_call" in data:
            tc = data["tool_call"]

            return {
                "name": tc.get("name"),
                "args": tc.get("args", {})
            }

    except Exception:
        return None

    return None


# -----------------------------
# EXECUTE TOOL
# -----------------------------
def execute_tool(tool_call: dict):
    name = tool_call["name"]
    args = tool_call.get("args", {})

    return tool_registry.run(name, args)