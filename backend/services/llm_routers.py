import os

# If you don't have these installed yet:
# pip install openai anthropic

try:
    from openai import OpenAI
except ImportError:  # pragma: no cover
    OpenAI = None

try:
    import anthropic
except ImportError:  # pragma: no cover
    anthropic = None

openai_client = None
if OpenAI is not None:
    openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

anthropic_client = None
if anthropic is not None:
    anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


def route_llm(model: str, prompt: str):
    if model == "gpt-4o":
        if openai_client is None:
            raise RuntimeError("OpenAI client is not available. Install openai and set OPENAI_API_KEY.")

        res = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )

        text = res.choices[0].message.content
        usage = res.usage

        return text, usage.prompt_tokens, usage.completion_tokens

    if model == "claude-3-5-sonnet":
        if anthropic is None or anthropic_client is None:
            raise RuntimeError("Anthropic client is not available. Install anthropic and set ANTHROPIC_API_KEY.")

        res = anthropic_client.messages.create(
            model="claude-3-5-sonnet",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        text = res.content[0].text

        # Anthropic doesn't always return token breakdown cleanly
        return text, 0, 0

    if model == "llama-3":
        # Placeholder (replace with your hosted endpoint)
        return "LLAMA-3 NOT CONNECTED", 0, 0

    raise ValueError("Unsupported model")