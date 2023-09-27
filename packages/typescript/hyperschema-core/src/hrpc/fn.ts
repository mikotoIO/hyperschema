import { ZodType, z } from 'zod';

export type InferInput<T extends Record<string, ZodType>> = {
  [K in keyof T]: z.infer<T[K]>;
};

export type SchemaFn<
  I extends Record<string, ZodType>,
  O extends ZodType,
  C,
> = (input: InferInput<I> & C) => Promise<z.infer<O>>;

// actual defs

export class FnBuilder<
  I extends Record<string, ZodType>,
  O extends ZodType,
  C,
> {
  constructor(
    public inputSchema: I,
    public outputSchema: O,
  ) {}

  do(fn: SchemaFn<I, O, C>) {
    return new HyperRPCFn(this.inputSchema, this.outputSchema, fn);
  }
}

export class HyperRPCFn<
  I extends Record<string, ZodType>,
  O extends ZodType,
  C = {},
> {
  private inputValidator: ZodType<InferInput<I>>;

  constructor(
    public input: I,
    public output: O,
    public fn: SchemaFn<I, O, C>,
  ) {
    this.inputValidator = z.object(input);
  }

  async call(ctx: C, args: unknown): Promise<z.infer<O>> {
    const parsedArgs = this.inputValidator.parse(args);
    return await this.fn(Object.assign(parsedArgs, ctx));
  }
}
