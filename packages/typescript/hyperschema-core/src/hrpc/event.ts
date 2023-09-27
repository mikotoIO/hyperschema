import { ZodType, z } from 'zod';

export class HyperRPCEvent<T extends ZodType> {
  constructor(public eventType: T) {}
  filter(fn: (input: z.infer<T>) => Promise<boolean>) {}
}
