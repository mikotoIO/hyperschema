from __future__ import annotations
from typing import List, Union
from pydantic import BaseModel
import textwrap
import black
import re

CAMEL_TO_SNAKE = re.compile(r"(?<!^)(?=[A-Z])")


def camel_to_snake(name):
    return CAMEL_TO_SNAKE.sub("_", name).lower()


type_map = {
    "string": "str",
    "int32": "int",
    "float64": "float",
    "bool": "bool",
    "nullable": "Optional",
    "array": "List",
}


class HSCompositeType(BaseModel):
    type: str
    param: List[HSType]


HSType = Union[HSCompositeType, str]


def join_path(basepath: str, endpoint: str):
    if basepath == "":
        return endpoint
    else:
        return basepath + "/" + endpoint


def generate_type(t: HSType):
    if isinstance(t, str):
        return type_map.get(t, t)
    else:
        return (
            f"{generate_type(t.type)}[{', '.join(generate_type(x) for x in t.param)}]"
        )


class HSField(BaseModel):
    name: str
    type: HSType

    def generate(self):
        return f"{self.name}: {generate_type(self.type)}"


class HSStruct(BaseModel):
    kind: str
    fields: List[HSField]

    def generate(self, name: str):
        if len(self.fields) == 0:
            return f"class {name}:\n    pass"
        fields = "\n    ".join(f"{x.generate()}" for x in self.fields)
        return f"class {name}(BaseModel):\n    " + fields


class HSFunction(BaseModel):
    input: List[HSField]
    output: HSType


class HSFunctionEntry(BaseModel):
    name: str
    fn: HSFunction

    def generate(self, path: str):
        body = (
            "    payload = {"
            + ",\n".join(
                [
                    f"    '{x.name}': TypeAdapter({generate_type(x.type)}).dump_python({x.name})"
                    for x in self.fn.input
                ]
            )
            + "}"
            + "\n"
            + f"    return TypeAdapter({generate_type(self.fn.output)})"
            + ".validate_python(await self.client.call('"
            + join_path(path, self.name)
            + "', payload))"
        )
        return (
            f"async def {camel_to_snake(self.name)}(self, "
            + ", ".join(f"{x.generate()}" for x in self.fn.input)
            + f") -> {generate_type(self.fn.output)}:\n"
            + body
            + "\n"
        )


class HSEventEntry(BaseModel):
    name: str
    event: HSType

    def generate(self, path: str):
        return (
            f"def {camel_to_snake(self.name)}(self, fn: Callable[[{generate_type(self.event)}], Coroutine[Any, Any, None]]):\n"
            + f"    @self.client.on('{join_path(path, self.name)}')\n"
            + f"    async def handler(data):\n"
            + f"        await fn(TypeAdapter({generate_type(self.event)}).validate_python(data))\n"
            + f"    return handler\n"
        )


class HSSubserviceEntry(BaseModel):
    name: str
    service: str


class HSService(BaseModel):
    path: str
    functions: List[HSFunctionEntry]
    events: List[HSEventEntry]
    subservices: List[HSSubserviceEntry]


class HSTypeEntry(BaseModel):
    name: str
    type: HSStruct


service_constructor = """
    client: Client
    def __init__(self, client: Client):
        self.client = client
"""


class HSServiceEntry(BaseModel):
    name: str
    service: HSService

    def generate(self):
        return (
            f"class {self.name}:\n"
            + "\n".join(f"    {x.name}: {x.service}" for x in self.service.subservices)
            + service_constructor
            + "\n".join(
                f"        self.{x.name} = {x.service}(client)"
                for x in self.service.subservices
            )
            + "\n"
            + "\n".join(
                [
                    textwrap.indent(x.generate(self.service.path), "    ")
                    for x in self.service.functions
                ]
            )
            + "\n"
            + "\n".join(
                [
                    textwrap.indent(x.generate(self.service.path), "    ")
                    for x in self.service.events
                ]
            )
        )


class Hyperschema(BaseModel):
    types: List[HSTypeEntry]
    services: List[HSServiceEntry]

    def generate(self):
        res = (
            PREAMBLE
            + "\n\n".join([x.type.generate(x.name) for x in self.types])
            + "\n\n"
            + "\n\n".join([x.generate() for x in self.services])
        )
        # return res
        return black.format_str(res, mode=black.FileMode())


# Generator goes here

PREAMBLE = """
# Generated File. Do not edit manually!
from __future__ import annotations

from pydantic import BaseModel, TypeAdapter
from typing import Optional, Any, List, Callable, Coroutine
import socketio


class Client:
    def __init__(self):
        self.sio = socketio.AsyncClient()

    async def call(self, event: str, payload) -> Any:
        res: Any = await self.sio.call(event, payload)
        if "err" in res:
            raise Exception(res["err"])
        return res.get("ok")

    def on(self, event: str, callback=None) -> Any:
        return self.sio.on(event, callback)

    def ready(self, fn):
        return self.sio.on("ready", fn)

    async def boot(self, url: str, auth_token: str):
        await self.sio.connect(url, auth={"token": auth_token}, wait_timeout=10)
        await self.sio.wait()


"""
