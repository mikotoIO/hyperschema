export class SocketIOServerTransport {
  onCall(callback: (path: string, ...args: unknown[]) => any) {}
  emit(path: string, event: unknown) {}
}
