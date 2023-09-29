import { Socket, io } from 'socket.io-client';

export class SocketIOClientTransport {
  io: Socket;
  constructor(private url: string) {
    this.io = io(this.url);
  }

  async call(path: string, input: any): Promise<any> {
    const res = await this.io.emitWithAck(path, input);
    if (res.error) {
      throw res.error;
    }
    return res.ok;
  }
}

function createClient() {}
