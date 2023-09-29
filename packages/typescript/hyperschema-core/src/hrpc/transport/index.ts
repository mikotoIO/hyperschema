import * as socketIO from 'socket.io';

import { HyperRPCService, MetaObject } from '..';

export class SocketIOServerTransport {
  onCall(callback: (path: string, ...args: unknown[]) => any) {}
  emit(path: string, event: unknown) {}
}

export function hostHyperRPC(io: socketIO.Server, service: HyperRPCService) {
  io.on('connection', async (socket) => {
    const context = await service.hyperRPC.contextFn();
    const meta: MetaObject = { connId: socket.id };
    context.$meta = meta;
    Object.keys(context).forEach((k) => {
      socket.data[k] = context[k];
    });

    socket.onAny((path, args: unknown, callback: (resp: any) => void) => {
      const fn = service.functions[path];
      fn.call(context, args)
        .then((ok) => callback({ ok }))
        .catch((err) => callback({ err }));
    });
  });
}
