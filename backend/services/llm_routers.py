import os

# If you don't have these installed yet:
# pip install openai anthropic

from openai import OpenAI
import anthropic

openai_client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
anthropic_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))


async def route_llm(model: str, prompt: str):
    
    if model == "gpt-4o":
        res = openai_client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}]
        )

        text = res.choices[0].message.content
        usage = res.usage

        return text, usage.prompt_tokens, usage.completion_tokens


    if model == "claude-3-5-sonnet":
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