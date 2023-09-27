import { ZodType } from 'zod';

import { HyperRPCEvent } from './event';
import { FnBuilder, HyperRPCFn } from './fn';

type ServiceFields = HyperRPCFn<any, any, any> | HyperRPCEvent<any>;

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
}

export class HyperRPCService {
  constructor(public functions: Record<string, HyperRPCFn<any, any, any>>) {}
}

export function defineService(handlers: { [key: string]: ServiceFields }) {
  const functions: Record<string, HyperRPCFn<any, any, any>> = {};
  Object.entries(handlers).forEach(([name, handler]) => {
    if (handler instanceof HyperRPCFn) {
      functions[name] = handler;
    }
  });
  return new HyperRPCService(functions);
}
