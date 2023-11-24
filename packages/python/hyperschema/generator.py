PREAMBLE = """
# Generated File. Do not edit manually!
from __future__ import annotations

from pydantic import BaseModel, TypeAdapter
from typing import Optional, Any, List, Callable, Coroutine
import socketio

class Client:
    def __init__(self):
        self.sio = socketio.AsyncClient()

    async def call(self, event: str, *args) -> Any:
        res = await self.sio.call(event, args)
        if 'err' in res:
            raise Exception(res['err'])
        return res.get('ok')

    def on(self, event: str, callback = None):
        return self.sio.on(event, callback)

    def ready(self, fn):
        return self.sio.on('ready', fn)
        
    async def boot(self, url: str):
        await self.sio.connect(url)
        await self.sio.wait()
"""