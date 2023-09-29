import { Socket, io } from 'socket.io-client';

export class SocketIOClientTransport {
  io: Socket;
  constructor(private url: string) {
    this.io = io(this.url);
  }

  async call(path: string, input: any): Promise<any> {
    const res = await this.io.emitWithAck(path, input);
    if (res.err) {
      throw new Error(res.err.message);
    }
    return res.ok;
  }

  on(path: string, cb: (x: any) => void) {
    this.io.on(path, cb);
    return () => {
      this.io.off(path, cb);
    };
  }
}

interface CreateClientOptions {
  url: string;
  authToken?: string;
  onReady?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

function createClient() {}
