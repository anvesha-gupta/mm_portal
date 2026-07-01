from typing import Callable, Dict, Any


class ToolRegistry:
    def __init__(self):
        self.tools: Dict[str, Callable] = {}

    def register(self, name: str):
        def wrapper(func: Callable):
            self.tools[name] = func
            return func
        return wrapper

    def run(self, name: str, args: Dict[str, Any]):
        if name not in self.tools:
            raise Exception(f"Tool not found: {name}")
        return self.tools[name](**args)


tool_registry = ToolRegistry()