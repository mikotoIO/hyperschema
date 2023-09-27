import * as socketIO from 'socket.io';

import { HyperRPCService } from '..';

export class SocketIOServerTransport {
  onCall(callback: (path: string, ...args: unknown[]) => any) {}
  emit(path: string, event: unknown) {}
}

export function hostHyperRPC(io: socketIO.Server, service: HyperRPCService) {
  io.on('connection', async (socket) => {
    socket.onAny((path, args: unknown, callback: (resp: any) => void) => {
      const fn = service.functions[path];
      fn.call({}, args)
        .then((ok) => callback({ ok }))
        .catch((err) => callback({ err }));
    });
  });
}
