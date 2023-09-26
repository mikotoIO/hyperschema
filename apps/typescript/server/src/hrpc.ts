import { ZodType, z } from 'zod';

class FnBuilder<Input = unknown, Output = undefined> {
  inputSchema?: Record<string, ZodType>;
  outputSchema: ZodType = z.any();

  schema<I extends Record<string, ZodType>, O extends ZodType>(
    input: I,
    output: O,
  ): FnBuilder<
    {
      [K in keyof I]: z.infer<I[K]>;
    },
    z.infer<O>
  > {
    return this as any;
  }

  do(fn: (input: Input) => Output) {}
}

class HyperRPC<Context> {
  fn<I extends Record<string, ZodType>, O extends ZodType>(
    input: I,
    output: O,
  ) {
    return new FnBuilder().schema(input, output);
  }
}

const hrpc = new HyperRPC();

hrpc.fn({ name: z.string() }, z.string()).do(({ name }) => {
  console.log(name);
  return name;
});
