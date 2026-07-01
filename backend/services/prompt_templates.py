from typing import Any


def build_playbench_prompt(history: list[dict[str, Any]], user_prompt: str) -> str:
    context_lines = [
        "You are a corporate AI assistant inside an internal platform.",
        "You have access to internal company data and tools.",
        "Use the tools only when necessary and always answer in a concise, professional manner.",
        "If you need to use a tool, respond only in JSON with a tool_call object.",
        "Example:\n{\n  \"tool_call\": {\n    \"name\": \"tool_name\",\n    \"args\": {}\n  }\n}\n",
        "Available tools:\n- list_apps\n- get_user_points\n- list_swag\n- get_dashboard_stats\n",
        "Conversation history follows. Respect the user context and only use tools when required.",
        "",
    ]

    for msg in history:
        role = msg.get("role", "user").upper()
        content = msg.get("content", "")
        context_lines.append(f"{role}: {content}")

    context_lines.append(f"USER: {user_prompt}")
    context_lines.append("ASSISTANT:")

    return "\n".join(context_lines)
