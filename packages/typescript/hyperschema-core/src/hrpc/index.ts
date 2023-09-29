import { ZodType } from 'zod';

import { HyperRPCEvent } from './event';
import { FnBuilder, HyperRPCFn } from './fn';

export type MetaObject = {
  connId: string;
};

type HyperRPCBaseFn = HyperRPCFn<any, any, any>;
type HyperRPCBaseEvent = HyperRPCEvent<any>;
type ServiceFields = HyperRPCService | HyperRPCBaseFn | HyperRPCBaseEvent;

export class HyperRPCService<Ctx = any> {
  constructor(
    public hyperRPC: HyperRPC<Ctx>,
    public subservices: Record<string, HyperRPCService>,
    public functions: Record<string, HyperRPCBaseFn>,
    public events: Record<string, HyperRPCBaseEvent>,
  ) {}
}

export class HyperRPC<Context = { $meta: MetaObject }> {
  contextFn: () => Context | Promise<Context> = async () => ({}) as any;

  context<T>(fn: () => T | Promise<T>): HyperRPC<Context & T> {
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
