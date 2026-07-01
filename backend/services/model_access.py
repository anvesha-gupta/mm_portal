def get_allowed_models(role_label: str | None):
    role_label = (role_label or "").lower()

    if role_label in ["admin", "superadmin"]:
        return ["gpt-4o", "claude-3-5-sonnet", "llama-3"]

    if role_label in ["analyst", "manager"]:
        return ["gpt-4o", "claude-3-5-sonnet"]

    return ["gpt-4o"]