import { ZodType } from 'zod';

import { HyperRPCEvent } from './event';
import { FnBuilder, HyperRPCFn } from './fn';

type HyperRPCBaseFn = HyperRPCFn<any, any, any>;
type HyperRPCBaseEvent = HyperRPCEvent<any>;
type ServiceFields = HyperRPCService | HyperRPCBaseFn | HyperRPCBaseEvent;

export class HyperRPCService {
  constructor(
    public hyperRPC: HyperRPC,
    public subservices: Record<string, HyperRPCService>,
    public functions: Record<string, HyperRPCBaseFn>,
    public events: Record<string, HyperRPCBaseEvent>,
  ) {}
}

export class HyperRPC<Context = {}> {
  contextFn: () => Promise<Context> = async () => ({}) as any;

  context<T>(fn: () => Promise<T>): HyperRPC<T> {
    this.contextFn = fn as any;
    return this as any;
  }

  fn<I extends Record<string, ZodType>, O extends ZodType>(
    input: I,
    output: O,
  ) {
    return new FnBuilder<I, O, Context>(input, output);
  }

  event<T extends ZodType>(event: T) {
    return new HyperRPCEvent(event);
  }

  service(handlers: { [key: string]: ServiceFields }) {
    const subservices: Record<string, HyperRPCService> = {};
    const functions: Record<string, HyperRPCBaseFn> = {};
    const events: Record<string, HyperRPCBaseEvent> = {};

    Object.entries(handlers).forEach(([name, p]) => {
      if (p instanceof HyperRPCService) {
        subservices[name] = p;
      } else if (p instanceof HyperRPCFn) {
        functions[name] = p;
      } else if (p instanceof HyperRPCEvent) {
        events[name] = p;
      }
    });
    return new HyperRPCService(this, subservices, functions, events);
  }
}
